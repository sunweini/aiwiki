package handler

import (
	"log"
	"strconv"
	"time"

	"yfsc-platform-v2/backend/internal/service"
	"yfsc-platform-v2/backend/pkg/response"

	"github.com/gin-gonic/gin"
)

// StatsHandler 数据统计处理器，处理销售统计、客流统计和用户增长数据查询
type StatsHandler struct {
	service *service.StatsService
}

func NewStatsHandler(svc *service.StatsService) *StatsHandler {
	return &StatsHandler{service: svc}
}

// parseDateRange 解析请求中的日期范围参数，默认返回最近7天
func parseDateRange(c *gin.Context) (time.Time, time.Time, bool) {
	startStr := c.Query("start_date")
	endStr := c.Query("end_date")

	var start, end time.Time
	var err error
	if startStr != "" {
		start, err = time.Parse("2006-01-02", startStr)
		if err != nil {
			return start, end, false
		}
	} else {
		start = time.Now().AddDate(0, 0, -7)
	}
	if endStr != "" {
		end, err = time.Parse("2006-01-02", endStr)
		if err != nil {
			return start, end, false
		}
		// 结束日期延长到当天最后一刻，确保包含全天数据
		end = end.Add(24*time.Hour - time.Nanosecond)
	} else {
		end = time.Now()
	}
	return start, end, true
}

// SalesOverview 获取销售概览数据，包含指定时间段内的总销售额、订单数等指标
func (h *StatsHandler) SalesOverview(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[StatsHandler] SalesOverview called by user %d", empID)

	start, end, ok := parseDateRange(c)
	if !ok {
		response.Error(c, 400, "invalid date format")
		return
	}

	var shopID *int64
	if sid := c.Query("shop_id"); sid != "" {
		id, _ := strconv.ParseInt(sid, 10, 64)
		shopID = &id
	}

	log.Printf("[StatsHandler] querying sales overview: start=%s end=%s shop_id=%v", start.Format("2006-01-02"), end.Format("2006-01-02"), shopID)
	stats, err := h.service.GetSalesOverview(start, end, shopID)
	if err != nil {
		log.Printf("[StatsHandler] SalesOverview failed: %v", err)
		response.ServerError(c, "failed to get sales overview")
		return
	}

	log.Printf("[StatsHandler] SalesOverview succeeded")
	response.OK(c, stats)
}

// SalesTrend 获取销售趋势数据，按天/周/月维度展示销售额变化曲线
func (h *StatsHandler) SalesTrend(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[StatsHandler] SalesTrend called by user %d", empID)

	start, end, ok := parseDateRange(c)
	if !ok {
		response.Error(c, 400, "invalid date format")
		return
	}

	period := c.DefaultQuery("period", "day")
	var shopID *int64
	if sid := c.Query("shop_id"); sid != "" {
		id, _ := strconv.ParseInt(sid, 10, 64)
		shopID = &id
	}

	log.Printf("[StatsHandler] querying sales trend: period=%s start=%s end=%s shop_id=%v", period, start.Format("2006-01-02"), end.Format("2006-01-02"), shopID)
	trend, err := h.service.GetSalesTrend(period, start, end, shopID)
	if err != nil {
		log.Printf("[StatsHandler] SalesTrend failed: %v", err)
		response.ServerError(c, "failed to get sales trend")
		return
	}

	log.Printf("[StatsHandler] SalesTrend succeeded")
	response.OK(c, trend)
}

// SalesByShop 获取各店铺销售排名数据，支持按园区筛选
func (h *StatsHandler) SalesByShop(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[StatsHandler] SalesByShop called by user %d", empID)

	start, end, ok := parseDateRange(c)
	if !ok {
		response.Error(c, 400, "invalid date format")
		return
	}

	var parkID *int64
	if pid := c.Query("park_id"); pid != "" {
		id, _ := strconv.ParseInt(pid, 10, 64)
		parkID = &id
	}

	log.Printf("[StatsHandler] querying sales by shop: start=%s end=%s park_id=%v", start.Format("2006-01-02"), end.Format("2006-01-02"), parkID)
	stats, err := h.service.GetSalesByShop(start, end, parkID)
	if err != nil {
		log.Printf("[StatsHandler] SalesByShop failed: %v", err)
		response.ServerError(c, "failed to get sales by shop")
		return
	}

	log.Printf("[StatsHandler] SalesByShop succeeded")
	response.OK(c, stats)
}

// FlowOverview 获取客流概览数据，包含入园人数、出园人数等指标
func (h *StatsHandler) FlowOverview(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[StatsHandler] FlowOverview called by user %d", empID)

	start, end, ok := parseDateRange(c)
	if !ok {
		response.Error(c, 400, "invalid date format")
		return
	}

	var parkID *int64
	if pid := c.Query("park_id"); pid != "" {
		id, _ := strconv.ParseInt(pid, 10, 64)
		parkID = &id
	}

	log.Printf("[StatsHandler] querying flow overview: start=%s end=%s park_id=%v", start.Format("2006-01-02"), end.Format("2006-01-02"), parkID)
	stats, err := h.service.GetFlowOverview(start, end, parkID)
	if err != nil {
		log.Printf("[StatsHandler] FlowOverview failed: %v", err)
		response.ServerError(c, "failed to get flow overview")
		return
	}

	log.Printf("[StatsHandler] FlowOverview succeeded")
	response.OK(c, stats)
}

// FlowTrend 获取客流趋势数据，按天/周/月维度展示人流变化曲线
func (h *StatsHandler) FlowTrend(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[StatsHandler] FlowTrend called by user %d", empID)

	start, end, ok := parseDateRange(c)
	if !ok {
		response.Error(c, 400, "invalid date format")
		return
	}

	period := c.DefaultQuery("period", "day")
	var parkID *int64
	if pid := c.Query("park_id"); pid != "" {
		id, _ := strconv.ParseInt(pid, 10, 64)
		parkID = &id
	}

	log.Printf("[StatsHandler] querying flow trend: period=%s start=%s end=%s park_id=%v", period, start.Format("2006-01-02"), end.Format("2006-01-02"), parkID)
	trend, err := h.service.GetFlowTrend(period, start, end, parkID)
	if err != nil {
		log.Printf("[StatsHandler] FlowTrend failed: %v", err)
		response.ServerError(c, "failed to get flow trend")
		return
	}

	log.Printf("[StatsHandler] FlowTrend succeeded")
	response.OK(c, trend)
}

// FlowHeatmap 获取客流热力图数据，按小时和星期展示人流密度分布
func (h *StatsHandler) FlowHeatmap(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[StatsHandler] FlowHeatmap called by user %d", empID)

	start, end, ok := parseDateRange(c)
	if !ok {
		response.Error(c, 400, "invalid date format")
		return
	}

	var parkID *int64
	if pid := c.Query("park_id"); pid != "" {
		id, _ := strconv.ParseInt(pid, 10, 64)
		parkID = &id
	}

	log.Printf("[StatsHandler] querying flow heatmap: start=%s end=%s park_id=%v", start.Format("2006-01-02"), end.Format("2006-01-02"), parkID)
	heatmap, err := h.service.GetFlowHeatmap(start, end, parkID)
	if err != nil {
		log.Printf("[StatsHandler] FlowHeatmap failed: %v", err)
		response.ServerError(c, "failed to get flow heatmap")
		return
	}

	log.Printf("[StatsHandler] FlowHeatmap succeeded")
	response.OK(c, heatmap)
}

// UserGrowth 获取用户增长数据，包含新增用户数、活跃用户数等增长指标
func (h *StatsHandler) UserGrowth(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[StatsHandler] UserGrowth called by user %d", empID)

	stats, err := h.service.GetUserGrowth()
	if err != nil {
		log.Printf("[StatsHandler] UserGrowth failed: %v", err)
		response.ServerError(c, "failed to get user growth")
		return
	}

	log.Printf("[StatsHandler] UserGrowth succeeded")
	response.OK(c, stats)
}
