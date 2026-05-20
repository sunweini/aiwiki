package service

import (
	"encoding/json"
	"fmt"
	"log"

	"yfsc-platform-v2/backend/internal/repository"
)

type CallbackService struct {
	orderRepo  *repository.OrderRepo
	refundRepo *repository.RefundRepo
}

func NewCallbackService(orderRepo *repository.OrderRepo, refundRepo *repository.RefundRepo) *CallbackService {
	return &CallbackService{
		orderRepo:  orderRepo,
		refundRepo: refundRepo,
	}
}

type WechatPayEvent struct {
	OutTradeNo    string `json:"out_trade_no"`
	TransactionID string `json:"transaction_id"`
	TradeState    string `json:"trade_state"`
	Amount        struct {
		Total int `json:"total"`
	} `json:"amount"`
}

// HandleWechatPay 处理微信支付回调：根据交易状态更新订单状态
func (s *CallbackService) HandleWechatPay(event *WechatPayEvent) error {
	log.Printf("[CallbackService] HandleWechatPay called, outTradeNo: %s, state: %s", event.OutTradeNo, event.TradeState)
	order, err := s.orderRepo.FindByOrderNo(event.OutTradeNo)
	if err != nil {
		log.Printf("[CallbackService] HandleWechatPay failed: order %s not found", event.OutTradeNo)
		return fmt.Errorf("order not found: %s", event.OutTradeNo)
	}

	switch event.TradeState {
	case "SUCCESS":
		if err := s.orderRepo.UpdateStatus(order.ID, "已支付"); err != nil {
			log.Printf("[CallbackService] HandleWechatPay failed: update status error %v", err)
			return err
		}
		log.Printf("[CallbackService] HandleWechatPay succeeded: order %s marked as 已支付", event.OutTradeNo)
	case "CLOSED":
		if err := s.orderRepo.UpdateStatus(order.ID, "已取消"); err != nil {
			log.Printf("[CallbackService] HandleWechatPay failed: update status error %v", err)
			return err
		}
		log.Printf("[CallbackService] HandleWechatPay succeeded: order %s marked as 已取消", event.OutTradeNo)
	case "REFUND":
		if err := s.orderRepo.UpdateStatus(order.ID, "已退款"); err != nil {
			log.Printf("[CallbackService] HandleWechatPay failed: update status error %v", err)
			return err
		}
		log.Printf("[CallbackService] HandleWechatPay succeeded: order %s marked as 已退款", event.OutTradeNo)
	default:
		log.Printf("[CallbackService] HandleWechatPay: unhandled state %s for order %s", event.TradeState, event.OutTradeNo)
	}
	return nil
}

type AlipayNotifyEvent struct {
	OutTradeNo  string `json:"out_trade_no"`
	TradeNo     string `json:"trade_no"`
	TradeStatus string `json:"trade_status"`
	TotalAmount string `json:"total_amount"`
}

// HandleAlipayPay 处理支付宝回调：根据交易状态更新订单状态
func (s *CallbackService) HandleAlipayPay(event *AlipayNotifyEvent) error {
	log.Printf("[CallbackService] HandleAlipayPay called, outTradeNo: %s, state: %s", event.OutTradeNo, event.TradeStatus)
	order, err := s.orderRepo.FindByOrderNo(event.OutTradeNo)
	if err != nil {
		log.Printf("[CallbackService] HandleAlipayPay failed: order %s not found", event.OutTradeNo)
		return fmt.Errorf("order not found: %s", event.OutTradeNo)
	}

	switch event.TradeStatus {
	case "TRADE_SUCCESS", "TRADE_FINISHED":
		if err := s.orderRepo.UpdateStatus(order.ID, "已支付"); err != nil {
			log.Printf("[CallbackService] HandleAlipayPay failed: update status error %v", err)
			return err
		}
		log.Printf("[CallbackService] HandleAlipayPay succeeded: order %s marked as 已支付", event.OutTradeNo)
	case "TRADE_CLOSED":
		if err := s.orderRepo.UpdateStatus(order.ID, "已取消"); err != nil {
			log.Printf("[CallbackService] HandleAlipayPay failed: update status error %v", err)
			return err
		}
		log.Printf("[CallbackService] HandleAlipayPay succeeded: order %s marked as 已取消", event.OutTradeNo)
	default:
		log.Printf("[CallbackService] HandleAlipayPay: unhandled state %s for order %s", event.TradeStatus, event.OutTradeNo)
	}
	return nil
}

type DouyinSPIEvent struct {
	EventType string          `json:"event_type"` // order_created/payment_success/refund_request/refund_result
	Data      json.RawMessage `json:"data"`
}

// HandleDouyinSPI 处理抖音开放平台SPI回调：处理支付成功、退款结果等事件
func (s *CallbackService) HandleDouyinSPI(event *DouyinSPIEvent) error {
	log.Printf("[CallbackService] HandleDouyinSPI called, eventType: %s", event.EventType)
	switch event.EventType {
	case "payment_success":
		var data struct {
			OrderNo string `json:"order_no"`
		}
		if err := json.Unmarshal(event.Data, &data); err != nil {
			log.Printf("[CallbackService] HandleDouyinSPI failed: payment data unmarshal error %v", err)
			return err
		}
		order, err := s.orderRepo.FindByOrderNo(data.OrderNo)
		if err != nil {
			log.Printf("[CallbackService] HandleDouyinSPI failed: order %s not found", data.OrderNo)
			return fmt.Errorf("order not found: %s", data.OrderNo)
		}
		if err := s.orderRepo.UpdateStatus(order.ID, "已支付"); err != nil {
			log.Printf("[CallbackService] HandleDouyinSPI failed: update status error %v", err)
			return err
		}
		log.Printf("[CallbackService] HandleDouyinSPI succeeded: payment for order %s", data.OrderNo)
	case "refund_result":
		var data struct {
			RefundNo string `json:"refund_no"`
			Status   string `json:"status"`
		}
		if err := json.Unmarshal(event.Data, &data); err != nil {
			log.Printf("[CallbackService] HandleDouyinSPI failed: refund data unmarshal error %v", err)
			return err
		}
		log.Printf("[CallbackService] HandleDouyinSPI: refund result received, refundNo=%s, status=%s", data.RefundNo, data.Status)
	default:
		log.Printf("[CallbackService] HandleDouyinSPI: unhandled event type %s", event.EventType)
	}
	return nil
}
