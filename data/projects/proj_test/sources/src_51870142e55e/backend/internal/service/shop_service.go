package service

import (
	"errors"
	"fmt"
	"log"

	"yfsc-platform-v2/backend/internal/model"
	"yfsc-platform-v2/backend/internal/repository"

	"gorm.io/gorm"
)

type ShopService struct {
	repo *repository.ShopRepo
}

func NewShopService(repo *repository.ShopRepo) *ShopService {
	return &ShopService{repo: repo}
}

// List 分页查询店铺列表，支持条件过滤
func (s *ShopService) List(page, pageSize int, filters map[string]interface{}) ([]model.Shop, int64, error) {
	log.Printf("[ShopService] List called, page: %d, pageSize: %d", page, pageSize)
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}
	return s.repo.List(page, pageSize, filters)
}

// GetByID 根据ID查询店铺详情
func (s *ShopService) GetByID(id int64) (*model.Shop, error) {
	log.Printf("[ShopService] GetByID called, id: %d", id)
	return s.repo.FindByID(id)
}

// Create 创建新店铺
func (s *ShopService) Create(shop *model.Shop) error {
	log.Printf("[ShopService] Create called, name: %s, parkID: %d", shop.Name, shop.ParkID)
	if err := s.repo.Create(shop); err != nil {
		log.Printf("[ShopService] Create failed: %v", err)
		return err
	}
	log.Printf("[ShopService] Create succeeded: id: %d", shop.ID)
	return nil
}

// Update 更新店铺信息
func (s *ShopService) Update(id int64, updates map[string]interface{}) error {
	log.Printf("[ShopService] Update called, id: %d", id)
	_, err := s.repo.FindByID(id)
	if err == gorm.ErrRecordNotFound {
		log.Printf("[ShopService] Update failed: shop %d not found", id)
		return errors.New("shop not found")
	}
	if err := s.repo.Update(id, updates); err != nil {
		log.Printf("[ShopService] Update failed: %v", err)
		return err
	}
	log.Printf("[ShopService] Update succeeded: id: %d", id)
	return nil
}

// Delete 删除店铺
func (s *ShopService) Delete(id int64) error {
	log.Printf("[ShopService] Delete called, id: %d", id)
	if err := s.repo.Delete(id); err != nil {
		log.Printf("[ShopService] Delete failed: %v", err)
		return err
	}
	log.Printf("[ShopService] Delete succeeded: id: %d", id)
	return nil
}

// Stats 获取店铺统计数据
func (s *ShopService) Stats() (map[string]int64, error) {
	log.Printf("[ShopService] Stats called")
	return s.repo.Stats()
}

// GenerateQRCodeURL 生成店铺收款二维码URL
func (s *ShopService) GenerateQRCodeURL(shopID int64, baseURL string) string {
	log.Printf("[ShopService] GenerateQRCodeURL called, shopID: %d", shopID)
	return fmt.Sprintf("%s/shop/%d", baseURL, shopID)
}
