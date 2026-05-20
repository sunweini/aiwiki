package service

import (
	"errors"
	"log"
	"time"

	"yfsc-platform-v2/backend/internal/model"
	"yfsc-platform-v2/backend/internal/repository"
)

type OrderService struct {
	orderRepo  *repository.OrderRepo
	refundRepo *repository.RefundRepo
	userRepo   *repository.UserRepo
}

func NewOrderService(orderRepo *repository.OrderRepo, refundRepo *repository.RefundRepo, userRepo *repository.UserRepo) *OrderService {
	return &OrderService{
		orderRepo:  orderRepo,
		refundRepo: refundRepo,
		userRepo:   userRepo,
	}
}

// List 分页查询订单列表，支持条件过滤
func (s *OrderService) List(page, pageSize int, filters map[string]interface{}) ([]model.Order, int64, error) {
	log.Printf("[OrderService] List called, page: %d, pageSize: %d, filters: %v", page, pageSize, filters)
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}
	return s.orderRepo.List(page, pageSize, filters)
}

// GetByID 根据ID查询订单详情
func (s *OrderService) GetByID(id int64) (*model.Order, error) {
	log.Printf("[OrderService] GetByID called, id: %d", id)
	return s.orderRepo.FindByID(id)
}

// Verify 核销订单：校验订单状态，将订单标记为已核销
func (s *OrderService) Verify(id int64) error {
	log.Printf("[OrderService] Verify called, id: %d", id)
	order, err := s.orderRepo.FindByID(id)
	if err != nil {
		log.Printf("[OrderService] Verify failed: order %d not found", id)
		return errors.New("order not found")
	}
	if order.Status != "已支付" && order.Status != "待核销" {
		log.Printf("[OrderService] Verify failed: order %d has invalid status %s", id, order.Status)
		return errors.New("order cannot be verified")
	}
	if err := s.orderRepo.Verify(id); err != nil {
		log.Printf("[OrderService] Verify failed: %v", err)
		return err
	}
	log.Printf("[OrderService] Verify succeeded: order %d", id)
	return nil
}

// CreateRefund 创建退款申请，记录退款原因和金额
func (s *OrderService) CreateRefund(orderID int64, userID int64, amount float64, reason string) error {
	log.Printf("[OrderService] CreateRefund called, orderID: %d, userID: %d, amount: %.2f", orderID, userID, amount)
	record := &model.RefundRecord{
		OrderID: orderID,
		UserID:  userID,
		Amount:  amount,
		Reason:  reason,
		Status:  "待审核",
	}
	if err := s.refundRepo.Create(record); err != nil {
		log.Printf("[OrderService] CreateRefund failed: %v", err)
		return err
	}
	log.Printf("[OrderService] CreateRefund succeeded: refund record created for order %d", orderID)
	return nil
}

// ListRefunds 分页查询退款记录列表
func (s *OrderService) ListRefunds(page, pageSize int, filters map[string]interface{}) ([]model.RefundRecord, int64, error) {
	log.Printf("[OrderService] ListRefunds called, page: %d, pageSize: %d", page, pageSize)
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}
	return s.refundRepo.List(page, pageSize, filters)
}

// ReviewRefund 审核退款：批准则原子性更新用户余额和订单状态，拒绝则标记驳回
func (s *OrderService) ReviewRefund(id int64, approved bool, reviewerID int64, note string) error {
	log.Printf("[OrderService] ReviewRefund called, id: %d, approved: %v, reviewerID: %d", id, approved, reviewerID)
	record, err := s.refundRepo.FindByID(id)
	if err != nil {
		log.Printf("[OrderService] ReviewRefund failed: refund record %d not found", id)
		return errors.New("refund record not found")
	}

	if approved {
		now := time.Now()
		if err := s.refundRepo.Approve(id, reviewerID, note, now); err != nil {
			log.Printf("[OrderService] ReviewRefund failed: approve error %v", err)
			return err
		}
		// Atomic balance update to avoid race condition
		if err := s.userRepo.IncrementBalance(record.UserID, record.Amount); err != nil {
			log.Printf("[OrderService] ReviewRefund failed: balance update error %v", err)
			return err
		}
		// Update order status
		if err := s.orderRepo.UpdateStatus(record.OrderID, "已退款"); err != nil {
			log.Printf("[OrderService] ReviewRefund failed: order status update error %v", err)
			return err
		}
		log.Printf("[OrderService] ReviewRefund succeeded: refund %d approved, user %d balance updated", id, record.UserID)
	} else {
		if err := s.refundRepo.Reject(id, reviewerID, note); err != nil {
			log.Printf("[OrderService] ReviewRefund failed: reject error %v", err)
			return err
		}
		log.Printf("[OrderService] ReviewRefund succeeded: refund %d rejected", id)
	}

	return nil
}

// Stats 获取店铺订单统计信息
func (s *OrderService) Stats(shopID *int64) (map[string]int64, error) {
	log.Printf("[OrderService] Stats called, shopID: %v", shopID)
	return s.orderRepo.Stats(shopID)
}
