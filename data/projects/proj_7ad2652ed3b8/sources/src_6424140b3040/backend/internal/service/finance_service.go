package service

import (
	"errors"
	"log"
	"time"

	"yfsc-platform-v2/backend/internal/model"
	"yfsc-platform-v2/backend/internal/repository"

	"gorm.io/gorm"
)

type FinanceService struct {
	financeRepo *repository.FinanceRepo
	shopRepo    *repository.ShopRepo
}

func NewFinanceService(financeRepo *repository.FinanceRepo, shopRepo *repository.ShopRepo) *FinanceService {
	return &FinanceService{
		financeRepo: financeRepo,
		shopRepo:    shopRepo,
	}
}

// ListWithdraw 分页查询提现申请列表，支持条件过滤
func (s *FinanceService) ListWithdraw(page, pageSize int, filters map[string]interface{}) ([]model.WithdrawApplication, int64, error) {
	log.Printf("[FinanceService] ListWithdraw called, page: %d, pageSize: %d", page, pageSize)
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}
	return s.financeRepo.ListWithdraw(page, pageSize, filters)
}

// CreateWithdraw 创建新的提现申请
func (s *FinanceService) CreateWithdraw(w *model.WithdrawApplication) error {
	log.Printf("[FinanceService] CreateWithdraw called, shopID: %d, amount: %.2f", w.ShopID, w.Amount)
	if err := s.financeRepo.CreateWithdraw(w); err != nil {
		log.Printf("[FinanceService] CreateWithdraw failed: %v", err)
		return err
	}
	log.Printf("[FinanceService] CreateWithdraw succeeded: id: %d", w.ID)
	return nil
}

// ReviewWithdraw 审核提现申请：批准则创建对账记录，拒绝则标记驳回
func (s *FinanceService) ReviewWithdraw(id int64, approved bool, reviewerID int64, note string) error {
	log.Printf("[FinanceService] ReviewWithdraw called, id: %d, approved: %v, reviewerID: %d", id, approved, reviewerID)
	withdraws, _, err := s.financeRepo.ListWithdraw(1, 1, map[string]interface{}{"id": id})
	if err != nil || len(withdraws) == 0 {
		log.Printf("[FinanceService] ReviewWithdraw failed: withdraw application %d not found", id)
		return errors.New("withdraw application not found")
	}

	w := &withdraws[0]

	if approved {
		if err := s.financeRepo.ApproveWithdraw(id, reviewerID, note); err != nil {
			log.Printf("[FinanceService] ReviewWithdraw failed: approve error %v", err)
			return err
		}
		now := time.Now()
		recon := &model.Reconciliation{
			ParkID:         w.Shop.ParkID,
			ShopID:         &w.ShopID,
			Date:           now,
			TotalAmount:    w.Amount,
			WithdrawAmount: w.Amount,
		}
		if err := s.financeRepo.CreateReconciliation(recon); err != nil {
			log.Printf("[FinanceService] ReviewWithdraw failed: reconciliation creation error %v", err)
			return err
		}
		log.Printf("[FinanceService] ReviewWithdraw succeeded: withdraw %d approved, reconciliation created", id)
	} else {
		if err := s.financeRepo.RejectWithdraw(id, reviewerID, note); err != nil {
			log.Printf("[FinanceService] ReviewWithdraw failed: reject error %v", err)
			return err
		}
		log.Printf("[FinanceService] ReviewWithdraw succeeded: withdraw %d rejected", id)
	}
	return nil
}

// ListReconciliation 分页查询对账单列表
func (s *FinanceService) ListReconciliation(page, pageSize int, filters map[string]interface{}) ([]model.Reconciliation, int64, error) {
	log.Printf("[FinanceService] ListReconciliation called, page: %d, pageSize: %d", page, pageSize)
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}
	return s.financeRepo.ListReconciliation(page, pageSize, filters)
}

// Suppress unused import warning
var _ = gorm.ErrRecordNotFound
