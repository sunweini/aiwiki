package router

import (
	"yfsc-platform-v2/backend/internal/handler"
	"yfsc-platform-v2/backend/internal/middleware"
	"yfsc-platform-v2/backend/internal/repository"
	"yfsc-platform-v2/backend/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

func Setup(db *gorm.DB, rdb *redis.Client) *gin.Engine {
	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(middleware.CORS())
	r.Use(middleware.Logger())

	middleware.InitRBAC(db)

	// Init repos
	empRepo := repository.NewEmployeeRepo(db)
	rbacRepo := repository.NewRBACRepo(db)
	parkRepo := repository.NewParkRepo(db)
	shopRepo := repository.NewShopRepo(db)
	userRepo := repository.NewUserRepo(db)
	orderRepo := repository.NewOrderRepo(db)
	refundRepo := repository.NewRefundRepo(db)
	financeRepo := repository.NewFinanceRepo(db)

	// Init services
	authService := service.NewAuthService(empRepo)
	empService := service.NewEmployeeService(empRepo)
	rbacService := service.NewRBACService(rbacRepo)
	parkService := service.NewParkService(parkRepo)
	shopService := service.NewShopService(shopRepo)
	userService := service.NewUserService(userRepo)
	orderService := service.NewOrderService(orderRepo, refundRepo, userRepo)
	financeService := service.NewFinanceService(financeRepo, shopRepo)

	// Init handlers
	authHandler := handler.NewAuthHandler(authService)
	empHandler := handler.NewEmployeeHandler(empService)
	rbacHandler := handler.NewRBACHandler(rbacService)
	parkHandler := handler.NewParkHandler(parkService)
	shopHandler := handler.NewShopHandler(shopService)
	userHandler := handler.NewUserHandler(userService)
	orderHandler := handler.NewOrderHandler(orderService)
	refundHandler := handler.NewRefundHandler(orderService)
	financeHandler := handler.NewFinanceHandler(financeService)

	// Phase 3 services & handlers
	positionService := service.NewPositionService(db)
	positionHandler := handler.NewPositionHandler(positionService)
	gateService := service.NewGateService(db)
	gateHandler := handler.NewGateHandler(gateService)
	activityService := service.NewActivityService(db)
	activityHandler := handler.NewActivityHandler(activityService)

	// Stats
	statsRepo := repository.NewStatsRepo(db)
	statsService := service.NewStatsService(statsRepo)
	statsHandler := handler.NewStatsHandler(statsService)

	callbackService := service.NewCallbackService(orderRepo, refundRepo)
	callbackHandler := handler.NewCallbackHandler(callbackService)

	// Settings
	settingsService := service.NewSettingsService(db)
	settingsHandler := handler.NewSettingsHandler(settingsService)

	// Meituan
	paymentRepo := repository.NewPaymentRepo(db)
	factory := service.NewPlatformClientFactory(db, rdb, paymentRepo)
	meituanService := service.NewMeituanService(db, paymentRepo, factory)
	meituanHandler := handler.NewMeituanHandler(meituanService)

	// Douyin
	douyinService := service.NewDouyinService(db, paymentRepo, factory)
	douyinHandler := handler.NewDouyinHandler(douyinService)

	// Public routes
	api := r.Group("/api/v1")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/login", authHandler.Login)
			auth.POST("/refresh", authHandler.Refresh)
			auth.POST("/logout", authHandler.Logout)
		}
	}

	// Callbacks (public, no JWT)
	callbacks := api.Group("/callback")
	{
		callbacks.POST("/wechat/pay", callbackHandler.WechatPay)
		callbacks.POST("/alipay/pay", callbackHandler.AlipayPay)
		callbacks.POST("/douyin/spi", callbackHandler.DouyinSPI)
		callbacks.GET("/ping", callbackHandler.Ping)
	}

	// Protected routes
	protected := api.Group("")
	protected.Use(middleware.JWTAuth())
	{
		// RBAC
		protected.GET("/rbac/menu", rbacHandler.GetMenu)
		protected.GET("/rbac/roles", rbacHandler.ListRoles)

		// Employee management
		employees := protected.Group("/employees")
		{
			employees.GET("", empHandler.List)
			employees.GET("/:id", empHandler.GetByID)
			employees.POST("", empHandler.Create)
			employees.PUT("/:id", empHandler.Update)
			employees.DELETE("/:id", empHandler.Delete)
			employees.POST("/:id/toggle", empHandler.ToggleStatus)
			employees.POST("/:id/reset-password", empHandler.ResetPassword)
		}

		// Parks
		parks := protected.Group("/parks")
		{
			parks.GET("", parkHandler.List)
			parks.POST("", parkHandler.Create)
			parks.GET("/:id", parkHandler.GetByID)
			parks.PUT("/:id", parkHandler.Update)
			parks.DELETE("/:id", parkHandler.Delete)
			parks.POST("/:id/toggle", parkHandler.ToggleStatus)
		}

		// Shops
		shops := protected.Group("/shops")
		{
			shops.GET("", shopHandler.List)
			shops.POST("", shopHandler.Create)
			shops.GET("/stats", shopHandler.Stats)
			shops.GET("/:id", shopHandler.GetByID)
			shops.PUT("/:id", shopHandler.Update)
			shops.DELETE("/:id", shopHandler.Delete)
			shops.GET("/:id/qrcode", shopHandler.GetQRCode)
		}

		// Users
		users := protected.Group("/users")
		{
			users.GET("", userHandler.List)
			users.POST("", userHandler.Create)
			users.GET("/stats", userHandler.Stats)
			users.GET("/:id", userHandler.GetByID)
			users.PUT("/:id", userHandler.Update)
			users.GET("/:id/recharges", userHandler.GetRecharges)
		}

		// Orders
		orders := protected.Group("/orders")
		{
			orders.GET("", orderHandler.List)
			orders.GET("/:id", orderHandler.GetByID)
			orders.POST("/:id/verify", orderHandler.Verify)
			orders.POST("/:id/refund", orderHandler.Refund)
		}

		// Refunds
		refunds := protected.Group("/refunds")
		{
			refunds.GET("", refundHandler.List)
			refunds.POST("/:id/review", refundHandler.Review)
		}

		// Finance
		finance := protected.Group("/finance")
		{
			finance.GET("/account", financeHandler.GetAccount)
			finance.POST("/withdraw", financeHandler.CreateWithdraw)
			finance.GET("/withdraws", financeHandler.ListWithdraws)
			finance.POST("/withdraws/:id/review", financeHandler.ReviewWithdraw)
			finance.GET("/reconcile", financeHandler.ListReconcile)
		}

		// Stats
		stats := protected.Group("/stats")
		{
			stats.GET("/sales", statsHandler.SalesOverview)
			stats.GET("/sales/trend", statsHandler.SalesTrend)
			stats.GET("/sales/by-shop", statsHandler.SalesByShop)
			stats.GET("/flow", statsHandler.FlowOverview)
			stats.GET("/flow/trend", statsHandler.FlowTrend)
			stats.GET("/flow/heatmap", statsHandler.FlowHeatmap)
			stats.GET("/user-growth", statsHandler.UserGrowth)
		}

		// Positions
		positions := protected.Group("/positions")
		{
			positions.GET("", positionHandler.List)
			positions.POST("", positionHandler.Create)
			positions.PUT("/:id", positionHandler.Update)
			positions.DELETE("/:id", positionHandler.Delete)
		}

		// Gates
		gates := protected.Group("/gates")
		{
			gates.GET("", gateHandler.List)
			gates.POST("", gateHandler.Create)
			gates.PUT("/:id", gateHandler.Update)
			gates.DELETE("/:id", gateHandler.Delete)
			gates.GET("/:id/entries", gateHandler.GetEntries)

		// Face Records
		faceRecords := protected.Group("/face-records")
		{
			faceRecords.GET("", gateHandler.GetFaceRecords)
			faceRecords.DELETE("/:id", gateHandler.DeleteFaceRecord)
		}

		// Entry Records
		entryRecords := protected.Group("/entry-records")
		{
			entryRecords.GET("", gateHandler.GetEntryRecords)
		}
		}

		// Activities
		activities := protected.Group("/activities")
		{
			activities.GET("", activityHandler.List)
			activities.POST("", activityHandler.Create)
			activities.PUT("/:id", activityHandler.Update)
			activities.DELETE("/:id", activityHandler.Delete)
			activities.GET("/:id/stats", activityHandler.GetStats)
		}

		// Permissions
		permHandler := handler.NewPermissionHandler(rbacService)
		permissions := protected.Group("/permissions")
		{
			permissions.GET("", permHandler.ListAllPermissions)
			permissions.GET("/roles/:id", permHandler.GetRolePermissions)
			permissions.PUT("/roles/:id", permHandler.UpdateRolePermissions)
		}

		// Settings
		settings := protected.Group("/settings")
		{
			settings.GET("/mp-config/:type", settingsHandler.GetMPConfig)
			settings.PUT("/mp-config/:type", settingsHandler.UpdateMPConfig)
			settings.GET("/logs", settingsHandler.ListLogs)
		}

		// Meituan
		meituan := protected.Group("/meituan")
		{
			meituan.GET("/dashboard", meituanHandler.Dashboard)
			meituan.GET("/records", meituanHandler.ListRecords)
			meituan.GET("/settlements", meituanHandler.ListSettlements)
			meituan.POST("/settlements/trigger", meituanHandler.TriggerSettlement)
			meituan.GET("/stores", meituanHandler.ListStores)
			meituan.POST("/stores", meituanHandler.UpsertStore)
			meituan.GET("/config", meituanHandler.GetConfig)
			meituan.PUT("/config", meituanHandler.UpdateConfig)
			meituan.POST("/records/query", meituanHandler.QueryCoupon)
			meituan.POST("/records/verify", meituanHandler.VerifyCoupon)
			meituan.POST("/records/:verify_no/revoke", meituanHandler.RevokeVerify)
		}

		// Douyin
		douyin := protected.Group("/douyin")
		{
			douyin.GET("/dashboard", douyinHandler.Dashboard)
			douyin.GET("/records", douyinHandler.ListRecords)
			douyin.GET("/settlements", douyinHandler.ListSettlements)
			douyin.POST("/settlements/trigger", douyinHandler.TriggerSettlement)
			douyin.GET("/stores", douyinHandler.ListStores)
			douyin.POST("/stores", douyinHandler.UpsertStore)
			douyin.GET("/config", douyinHandler.GetConfig)
			douyin.PUT("/config", douyinHandler.UpdateConfig)
			douyin.GET("/stats", douyinHandler.GetStats)
			douyin.POST("/records/query", douyinHandler.QueryCoupon)
			douyin.POST("/records/verify", douyinHandler.VerifyCoupon)
			douyin.POST("/records/:verify_no/revoke", douyinHandler.RevokeVerify)
		}
	}

	return r
}
