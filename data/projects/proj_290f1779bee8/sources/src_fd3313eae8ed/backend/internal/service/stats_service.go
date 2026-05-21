package service

import (
	"log"
	"time"

	"yfsc-platform-v2/backend/internal/repository"
)

type StatsService struct {
	repo *repository.StatsRepo
}

func NewStatsService(repo *repository.StatsRepo) *StatsService {
	return &StatsService{repo: repo}
}

// GetSalesOverview 获取销售概览数据（总销售额、订单数、退款额等）
func (s *StatsService) GetSalesOverview(start, end time.Time, shopID *int64) (*repository.SalesOverview, error) {
	log.Printf("[StatsService] GetSalesOverview called, start: %s, end: %s, shopID: %v", start, end, shopID)
	return s.repo.GetSalesOverview(start, end, shopID)
}

// GetSalesTrend 获取销售趋势数据（按日/周/月聚合）
func (s *StatsService) GetSalesTrend(period string, start, end time.Time, shopID *int64) ([]repository.SalesTrendPoint, error) {
	log.Printf("[StatsService] GetSalesTrend called, period: %s, start: %s, end: %s", period, start, end)
	return s.repo.GetSalesTrend(period, start, end, shopID)
}

// GetSalesByShop 按店铺维度统计销售额
func (s *StatsService) GetSalesByShop(start, end time.Time, parkID *int64) ([]repository.SalesByShop, error) {
	log.Printf("[StatsService] GetSalesByShop called, start: %s, end: %s, parkID: %v", start, end, parkID)
	return s.repo.GetSalesByShop(start, end, parkID)
}

// GetFlowOverview 获取客流概览数据（入园人数、出园人数等）
func (s *StatsService) GetFlowOverview(start, end time.Time, parkID *int64) (*repository.FlowOverview, error) {
	log.Printf("[StatsService] GetFlowOverview called, start: %s, end: %s, parkID: %v", start, end, parkID)
	return s.repo.GetFlowOverview(start, end, parkID)
}

// GetFlowTrend 获取客流趋势数据（按时间段聚合）
func (s *StatsService) GetFlowTrend(period string, start, end time.Time, parkID *int64) ([]repository.FlowTrendPoint, error) {
	log.Printf("[StatsService] GetFlowTrend called, period: %s, start: %s, end: %s", period, start, end)
	return s.repo.GetFlowTrend(period, start, end, parkID)
}

// GetFlowHeatmap 获取客流热力图数据（时段x日期二维分布）
func (s *StatsService) GetFlowHeatmap(start, end time.Time, parkID *int64) ([]repository.HeatmapPoint, error) {
	log.Printf("[StatsService] GetFlowHeatmap called, start: %s, end: %s", start, end)
	return s.repo.GetFlowHeatmap(start, end, parkID)
}

// GetUserGrowth 获取用户增长统计
func (s *StatsService) GetUserGrowth() (*repository.UserGrowthStats, error) {
	log.Printf("[StatsService] GetUserGrowth called")
	return s.repo.GetUserGrowth()
}
