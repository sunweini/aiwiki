package repository

import (
	"time"

	"yfsc-platform-v2/backend/internal/model"

	"gorm.io/gorm"
)

type StatsRepo struct {
	db *gorm.DB
}

func NewStatsRepo(db *gorm.DB) *StatsRepo {
	return &StatsRepo{db: db}
}

// Sales overview: total orders, total amount, avg amount
type SalesOverview struct {
	TotalOrders int64   `json:"total_orders"`
	TotalAmount float64 `json:"total_amount"`
	AvgAmount   float64 `json:"avg_amount"`
}

func (r *StatsRepo) GetSalesOverview(start, end time.Time, shopID *int64) (*SalesOverview, error) {
	query := r.db.Model(&model.Order{}).Where("created_at BETWEEN ? AND ?", start, end)
	if shopID != nil {
		query = query.Where("shop_id = ?", *shopID)
	}

	var stats SalesOverview
	if err := query.Select("count(*) as total_orders, COALESCE(sum(amount), 0) as total_amount").Scan(&stats).Error; err != nil {
		return nil, err
	}
	if stats.TotalOrders > 0 {
		stats.AvgAmount = stats.TotalAmount / float64(stats.TotalOrders)
	}
	return &stats, nil
}

// Sales trend: grouped by day/week/month
type SalesTrendPoint struct {
	Date  string  `json:"date"`
	Count int64   `json:"count"`
	Total float64 `json:"total"`
}

func (r *StatsRepo) GetSalesTrend(period string, start, end time.Time, shopID *int64) ([]SalesTrendPoint, error) {
	var results []SalesTrendPoint
	query := r.db.Model(&model.Order{}).Where("created_at BETWEEN ? AND ?", start, end)
	if shopID != nil {
		query = query.Where("shop_id = ?", *shopID)
	}

	var dateExpr string
	switch period {
	case "day":
		dateExpr = "DATE(created_at)"
	case "week":
		dateExpr = "YEARWEEK(created_at)"
	case "month":
		dateExpr = "DATE_FORMAT(created_at, '%Y-%m')"
	default:
		dateExpr = "DATE(created_at)"
	}

	if err := query.Select(dateExpr + " as date, count(*) as count, COALESCE(sum(amount), 0) as total").
		Group(dateExpr).Order("date ASC").Find(&results).Error; err != nil {
		return nil, err
	}
	return results, nil
}

// Sales by shop
type SalesByShop struct {
	ShopID   int64   `json:"shop_id"`
	ShopName string  `json:"shop_name"`
	Count    int64   `json:"count"`
	Total    float64 `json:"total"`
}

func (r *StatsRepo) GetSalesByShop(start, end time.Time, parkID *int64) ([]SalesByShop, error) {
	var results []SalesByShop
	query := r.db.Table("order").
		Select("orders.shop_id, shops.name as shop_name, count(*) as count, COALESCE(sum(orders.amount), 0) as total").
		Joins("LEFT JOIN shops ON shops.id = orders.shop_id").
		Where("orders.created_at BETWEEN ? AND ?", start, end)
	if parkID != nil {
		query = query.Where("shops.park_id = ?", *parkID)
	}

	if err := query.Group("orders.shop_id, shops.name").Order("total DESC").Find(&results).Error; err != nil {
		return nil, err
	}
	return results, nil
}

// Flow overview
type FlowOverview struct {
	TotalFlow   int64 `json:"total_flow"`
	TodayFlow   int64 `json:"today_flow"`
	PeakHour    int   `json:"peak_hour"`
	PeakHourCnt int64 `json:"peak_hour_count"`
}

func (r *StatsRepo) GetFlowOverview(start, end time.Time, parkID *int64) (*FlowOverview, error) {
	var stats FlowOverview

	query := r.db.Model(&model.GateEntryRecord{}).Where("entry_time BETWEEN ? AND ?", start, end)
	if parkID != nil {
		query = query.Joins("LEFT JOIN gate_device ON gate_device.id = gate_entry_record.gate_id").
			Where("gate_device.park_id = ?", *parkID)
	}

	query.Count(&stats.TotalFlow)

	// Today
	today := time.Now().Truncate(24 * time.Hour)
	tomorrow := today.Add(24 * time.Hour)
	todayQuery := r.db.Model(&model.GateEntryRecord{}).Where("entry_time BETWEEN ? AND ?", today, tomorrow)
	if parkID != nil {
		todayQuery = todayQuery.Joins("LEFT JOIN gate_device ON gate_device.id = gate_entry_record.gate_id").
			Where("gate_device.park_id = ?", *parkID)
	}
	todayQuery.Count(&stats.TodayFlow)

	// Peak hour
	type HourCount struct {
		Hour  int
		Count int64
	}
	var hours []HourCount
	r.db.Model(&model.GateEntryRecord{}).
		Select("HOUR(entry_time) as hour, count(*) as count").
		Where("entry_time BETWEEN ? AND ?", start, end).
		Group("HOUR(entry_time)").
		Order("count DESC").
		Find(&hours)

	if len(hours) > 0 {
		stats.PeakHour = hours[0].Hour
		stats.PeakHourCnt = hours[0].Count
	}

	return &stats, nil
}

// Flow trend
type FlowTrendPoint struct {
	Date  string `json:"date"`
	Count int64  `json:"count"`
}

func (r *StatsRepo) GetFlowTrend(period string, start, end time.Time, parkID *int64) ([]FlowTrendPoint, error) {
	var results []FlowTrendPoint
	query := r.db.Model(&model.GateEntryRecord{}).Where("entry_time BETWEEN ? AND ?", start, end)
	if parkID != nil {
		query = query.Joins("LEFT JOIN gate_device ON gate_device.id = gate_entry_record.gate_id").
			Where("gate_device.park_id = ?", *parkID)
	}

	dateExpr := "DATE(entry_time)"
	if period == "month" {
		dateExpr = "DATE_FORMAT(entry_time, '%Y-%m')"
	}

	if err := query.Select(dateExpr+" as date, count(*) as count").
		Group(dateExpr).Order("date ASC").Find(&results).Error; err != nil {
		return nil, err
	}
	return results, nil
}

// Flow heatmap: hour x day_of_week
type HeatmapPoint struct {
	Hour      int   `json:"hour"`
	DayOfWeek int   `json:"day_of_week"`
	Count     int64 `json:"count"`
}

func (r *StatsRepo) GetFlowHeatmap(start, end time.Time, parkID *int64) ([]HeatmapPoint, error) {
	var results []HeatmapPoint
	query := r.db.Model(&model.GateEntryRecord{}).Where("entry_time BETWEEN ? AND ?", start, end)
	if parkID != nil {
		query = query.Joins("LEFT JOIN gate_device ON gate_device.id = gate_entry_record.gate_id").
			Where("gate_device.park_id = ?", *parkID)
	}

	if err := query.Select("HOUR(entry_time) as hour, DAYOFWEEK(entry_time)-1 as day_of_week, count(*) as count").
		Group("hour, day_of_week").Find(&results).Error; err != nil {
		return nil, err
	}
	return results, nil
}

// User growth
type UserGrowthStats struct {
	TotalUsers    int64 `json:"total_users"`
	NewToday      int64 `json:"new_today"`
	NewThisWeek   int64 `json:"new_this_week"`
	NewThisMonth  int64 `json:"new_this_month"`
	AvgActiveDays int64 `json:"avg_active_days"`
}

func (r *StatsRepo) GetUserGrowth() (*UserGrowthStats, error) {
	var stats UserGrowthStats
	r.db.Model(&model.User{}).Count(&stats.TotalUsers)

	today := time.Now().Truncate(24 * time.Hour)
	r.db.Model(&model.User{}).Where("created_at >= ?", today).Count(&stats.NewToday)

	weekStart := today.AddDate(0, 0, -int(today.Weekday()))
	r.db.Model(&model.User{}).Where("created_at >= ?", weekStart).Count(&stats.NewThisWeek)

	monthStart := time.Date(today.Year(), today.Month(), 1, 0, 0, 0, 0, today.Location())
	r.db.Model(&model.User{}).Where("created_at >= ?", monthStart).Count(&stats.NewThisMonth)

	return &stats, nil
}
