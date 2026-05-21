package service

import (
	"context"
	"fmt"
	"log"
	"strconv"
	"time"

	"yfsc-platform-v2/backend/internal/model"
	"yfsc-platform-v2/backend/internal/repository"
	"yfsc-platform-v2/backend/pkg/douyin"
	"yfsc-platform-v2/backend/pkg/meituan"

	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

// PlatformClientFactory 创建美团/抖音 SDK 客户端，管理门店 token 生命周期
type PlatformClientFactory struct {
	db          *gorm.DB
	rdb         *redis.Client
	paymentRepo *repository.PaymentRepo
	meituanBase string
	douyinBase  string
}

func NewPlatformClientFactory(db *gorm.DB, rdb *redis.Client, paymentRepo *repository.PaymentRepo) *PlatformClientFactory {
	return &PlatformClientFactory{
		db:          db,
		rdb:         rdb,
		paymentRepo: paymentRepo,
		meituanBase: "https://open-api.meituan.com",
		douyinBase:  "https://open.douyin.com",
	}
}

// CreateMeituanClient 从 DB 配置创建美团 SDK 客户端
func (f *PlatformClientFactory) CreateMeituanClient() (*meituan.Client, error) {
	var cfg model.MeituanApiConfig
	if err := f.db.First(&cfg).Error; err != nil {
		return nil, fmt.Errorf("meituan config not found: %w", err)
	}
	devID := parseInt64(cfg.AppID)
	return meituan.NewClient(devID, cfg.AppSecret, f.meituanBase), nil
}

// CreateDouyinClient 从 DB 配置创建抖音 SDK 客户端
func (f *PlatformClientFactory) CreateDouyinClient() (*douyin.Client, error) {
	var cfg model.DouyinApiConfig
	if err := f.db.First(&cfg).Error; err != nil {
		return nil, fmt.Errorf("douyin config not found: %w", err)
	}
	return douyin.NewClient(cfg.ClientKey, cfg.ClientSecret, f.douyinBase), nil
}

// GetStoreToken 获取门店 appAuthToken，优先 Redis 缓存
func (f *PlatformClientFactory) GetStoreToken(ctx context.Context, platform string, shopID int64) (string, error) {
	cacheKey := fmt.Sprintf("platform:token:%s:%d", platform, shopID)
	if f.rdb != nil {
		if token, err := f.rdb.Get(ctx, cacheKey).Result(); err == nil && token != "" {
			return token, nil
		}
	}

	switch platform {
	case "meituan":
		var m model.MeituanStoreMapping
		if err := f.db.Where("shop_id = ? AND status = ?", shopID, 1).First(&m).Error; err != nil {
			return "", fmt.Errorf("meituan store not bound for shop %d: %w", shopID, err)
		}
		if m.AccessToken == "" {
			return "", fmt.Errorf("meituan store token not available for shop %d", shopID)
		}
		return m.AccessToken, nil
	case "douyin":
		var d model.DouyinStoreMapping
		if err := f.db.Where("shop_id = ? AND status = ?", shopID, 1).First(&d).Error; err != nil {
			return "", fmt.Errorf("douyin store not bound for shop %d: %w", shopID, err)
		}
		if d.AccessToken == "" {
			return "", fmt.Errorf("douyin store token not available for shop %d", shopID)
		}
		return d.AccessToken, nil
	}
	return "", fmt.Errorf("unknown platform: %s", platform)
}

// RefreshMeituanToken 刷新美团门店 token 并写入缓存
func (f *PlatformClientFactory) RefreshMeituanToken(ctx context.Context, shopID int64) error {
	var mapping model.MeituanStoreMapping
	if err := f.db.Where("shop_id = ?", shopID).First(&mapping).Error; err != nil {
		return err
	}
	if mapping.AccessToken == "" {
		return fmt.Errorf("no access token for meituan shop %d", shopID)
	}

	client, err := f.CreateMeituanClient()
	if err != nil {
		return err
	}

	// Meituan token refresh — try with current token as refresh mechanism
	token, err := client.RefreshToken(ctx, meituan.BusinessIDVerify, mapping.AccessToken)
	if err != nil {
		return fmt.Errorf("meituan token refresh failed: %w", err)
	}

	updates := map[string]interface{}{
		"access_token":     token.AccessToken,
		"token_expires_at": time.Now().Add(time.Duration(token.ExpiresIn) * time.Second),
	}
	if err := f.db.Model(&mapping).Updates(updates).Error; err != nil {
		return err
	}

	if f.rdb != nil {
		ttl := time.Duration(token.ExpiresIn-300) * time.Second
		if ttl < 60*time.Second {
			ttl = 60 * time.Second
		}
		cacheKey := fmt.Sprintf("platform:token:meituan:%d", shopID)
		f.rdb.Set(ctx, cacheKey, token.AccessToken, ttl)
	}

	log.Printf("[PlatformClientFactory] Meituan token refreshed for shop %d", shopID)
	return nil
}

// RefreshDouyinToken 刷新抖音门店 token 并写入缓存
func (f *PlatformClientFactory) RefreshDouyinToken(ctx context.Context, shopID int64) error {
	var mapping model.DouyinStoreMapping
	if err := f.db.Where("shop_id = ?", shopID).First(&mapping).Error; err != nil {
		return err
	}

	client, err := f.CreateDouyinClient()
	if err != nil {
		return err
	}

	token, err := client.RefreshAccessToken(ctx, mapping.AccessToken)
	if err != nil {
		return fmt.Errorf("douyin token refresh failed: %w", err)
	}

	updates := map[string]interface{}{
		"access_token":     token.AccessToken,
		"token_expires_at": time.Now().Add(time.Duration(token.ExpiresIn) * time.Second),
	}
	if err := f.db.Model(&mapping).Updates(updates).Error; err != nil {
		return err
	}

	if f.rdb != nil {
		ttl := time.Duration(token.ExpiresIn-300) * time.Second
		if ttl < 60*time.Second {
			ttl = 60 * time.Second
		}
		cacheKey := fmt.Sprintf("platform:token:douyin:%d", shopID)
		f.rdb.Set(ctx, cacheKey, token.AccessToken, ttl)
	}

	log.Printf("[PlatformClientFactory] Douyin token refreshed for shop %d", shopID)
	return nil
}

// parseInt64 安全转换字符串为 int64
func parseInt64(s string) int64 {
	v, _ := strconv.ParseInt(s, 10, 64)
	return v
}

// PtrTime 返回 time.Time 指针（用于 GORM nullable 时间字段）
func PtrTime(t time.Time) *model.Time {
	return &t
}
