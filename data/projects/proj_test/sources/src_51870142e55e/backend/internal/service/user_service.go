package service

import (
	"errors"
	"log"

	"yfsc-platform-v2/backend/internal/model"
	"yfsc-platform-v2/backend/internal/repository"

	"gorm.io/gorm"
)

type UserService struct {
	repo *repository.UserRepo
}

func NewUserService(repo *repository.UserRepo) *UserService {
	return &UserService{repo: repo}
}

// List 分页查询客户列表，支持条件过滤
func (s *UserService) List(page, pageSize int, filters map[string]interface{}) ([]model.User, int64, error) {
	log.Printf("[UserService] List called, page: %d, pageSize: %d", page, pageSize)
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}
	return s.repo.List(page, pageSize, filters)
}

// GetByID 根据ID查询客户详情
func (s *UserService) GetByID(id int64) (*model.User, error) {
	log.Printf("[UserService] GetByID called, id: %d", id)
	return s.repo.FindByID(id)
}

// Create 创建客户（检查手机号去重）
func (s *UserService) Create(user *model.User) error {
	log.Printf("[UserService] Create called, phone: %s, nickname: %s", user.Phone, user.Nickname)
	if user.Phone != "" {
		existing, _ := s.repo.FindByPhone(user.Phone)
		if existing != nil {
			log.Printf("[UserService] Create failed: phone %s already exists", user.Phone)
			return errors.New("phone already exists")
		}
	}
	if err := s.repo.Create(user); err != nil {
		log.Printf("[UserService] Create failed: %v", err)
		return err
	}
	log.Printf("[UserService] Create succeeded: id: %d", user.ID)
	return nil
}

// Update 更新客户信息
func (s *UserService) Update(id int64, updates map[string]interface{}) error {
	log.Printf("[UserService] Update called, id: %d", id)
	_, err := s.repo.FindByID(id)
	if err == gorm.ErrRecordNotFound {
		log.Printf("[UserService] Update failed: user %d not found", id)
		return errors.New("user not found")
	}
	if err := s.repo.Update(id, updates); err != nil {
		log.Printf("[UserService] Update failed: %v", err)
		return err
	}
	log.Printf("[UserService] Update succeeded: id: %d", id)
	return nil
}

// Stats 获取客户统计数据
func (s *UserService) Stats() (map[string]interface{}, error) {
	log.Printf("[UserService] Stats called")
	return s.repo.Stats()
}

// RechargeList 查询指定客户的充值记录
func (s *UserService) RechargeList(userID int64, page, pageSize int) ([]model.RechargeRecord, int64, error) {
	log.Printf("[UserService] RechargeList called, userID: %d", userID)
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}
	return s.repo.RechargeList(userID, page, pageSize)
}
