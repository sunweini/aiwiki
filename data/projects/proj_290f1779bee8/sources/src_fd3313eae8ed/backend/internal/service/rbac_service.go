package service

import (
	"log"

	"yfsc-platform-v2/backend/internal/model"
	"yfsc-platform-v2/backend/internal/repository"
)

var MenuVisibility = map[string]map[string]bool{
	"platform": {
		"overview": true, "databoard": true, "parks": true, "park-list": true, "park-add": true,
		"shops": true, "shop-list": true, "shop-stats": true, "shop-types": true,
		"users": true, "user-list": true, "user-stats": true, "recharge-records": true,
		"consumption": true, "order-list": true, "refund": true, "verify": true,
		"sales-stats": true, "flow-stats": true, "finance": true, "park-account": true,
		"withdraw": true, "reconcile": true,
		"employees": true, "employee-list": true, "position-list": true,
		"gates": true, "gate-list": true, "face-list": true, "entry-records": true,
		"activities": true, "activity-list": true, "activity-create": true,
		"permissions": true, "role-perm": true,
		"mp-mgmt": true, "mp-client": true, "mp-merchant": true, "mp-admin": true,
		"settings": true, "mp-config": true, "logs": true,
		"meituan": true, "meituan-dashboard": true, "meituan-records": true,
		"meituan-settlement": true, "meituan-config": true,
		"douyin": true, "douyin-dashboard": true, "douyin-records": true,
		"douyin-settlement": true, "douyin-config": true,
	},
	"park": {
		"shops": true, "shop-list": true, "shop-stats": true, "shop-types": true,
		"users": true, "user-list": true, "user-stats": true, "recharge-records": true,
		"consumption": true, "order-list": true, "refund": true, "verify": true,
		"finance": true, "park-account": true, "withdraw": true, "reconcile": true,
		"gates": true, "gate-list": true, "face-list": true, "entry-records": true,
		"activities": true, "activity-list": true,
		"mp-client": true, "mp-merchant": true, "mp-admin": true,
		"meituan": true, "meituan-dashboard": true, "meituan-records": true,
		"meituan-settlement": true, "meituan-config": true,
		"douyin": true, "douyin-dashboard": true, "douyin-records": true,
		"douyin-settlement": true, "douyin-config": true,
	},
	"shop": {
		"consumption": true, "order-list": true, "verify": true, "refund": true,
		"withdraw": true,
		"meituan": true, "meituan-dashboard": true, "meituan-records": true, "meituan-settlement": true,
		"douyin": true, "douyin-dashboard": true, "douyin-records": true, "douyin-settlement": true,
	},
}

type MenuItem struct {
	ID    string     `json:"id"`
	Icon  string     `json:"icon"`
	Label string     `json:"label"`
	Page  string     `json:"page,omitempty"`
	Sub   []MenuItem `json:"sub,omitempty"`
}

type RBACService struct {
	repo *repository.RBACRepo
}

func NewRBACService(repo *repository.RBACRepo) *RBACService {
	return &RBACService{repo: repo}
}

// GetMenu 根据视图类型和角色编码获取可见菜单树
func (s *RBACService) GetMenu(view string, roleCode string) []MenuItem {
	log.Printf("[RBACService] GetMenu called, view: %s, roleCode: %s", view, roleCode)
	visibility := MenuVisibility[view]
	if visibility == nil {
		return []MenuItem{}
	}
	return s.buildMenu(visibility)
}

func (s *RBACService) buildMenu(visibility map[string]bool) []MenuItem {
	fullMenu := []MenuItem{
		{ID: "overview", Label: "园区总览", Page: "overview"},
		{ID: "databoard", Label: "数据看板", Page: "databoard"},
		{ID: "sales-stats", Label: "销售统计", Page: "sales-stats"},
		{ID: "flow-stats", Label: "客流统计", Page: "flow-stats"},
		{ID: "parks", Label: "园区管理", Sub: []MenuItem{
			{ID: "park-list", Label: "园区列表", Page: "park-list"},
			{ID: "park-add", Label: "新增园区", Page: "park-add"},
		}},
		{ID: "shops", Label: "店铺管理", Sub: []MenuItem{
			{ID: "shop-list", Label: "店铺列表", Page: "shop-list"},
			{ID: "shop-stats", Label: "店铺统计", Page: "shop-stats"},
			{ID: "shop-types", Label: "店铺类型", Page: "shop-types"},
		}},
		{ID: "users", Label: "客户管理", Sub: []MenuItem{
			{ID: "user-list", Label: "客户列表", Page: "user-list"},
			{ID: "user-stats", Label: "客户统计", Page: "user-stats"},
			{ID: "recharge-records", Label: "充值记录", Page: "recharge-records"},
		}},
		{ID: "consumption", Label: "消费管理", Sub: []MenuItem{
			{ID: "order-list", Label: "订单列表", Page: "order-list"},
			{ID: "verify", Label: "核销管理", Page: "verify"},
			{ID: "refund", Label: "退款处理", Page: "refund"},
		}},
		{ID: "meituan", Label: "美团核销", Sub: []MenuItem{
			{ID: "meituan-dashboard", Label: "核销仪表盘", Page: "meituan-dashboard"},
			{ID: "meituan-records", Label: "验券记录", Page: "meituan-records"},
			{ID: "meituan-settlement", Label: "结算明细", Page: "meituan-settlement"},
			{ID: "meituan-config", Label: "API 配置", Page: "meituan-config"},
		}},
		{ID: "douyin", Label: "抖音核销", Sub: []MenuItem{
			{ID: "douyin-dashboard", Label: "核销仪表盘", Page: "douyin-dashboard"},
			{ID: "douyin-records", Label: "验券记录", Page: "douyin-records"},
			{ID: "douyin-settlement", Label: "结算明细", Page: "douyin-settlement"},
			{ID: "douyin-config", Label: "API 配置", Page: "douyin-config"},
		}},
		{ID: "finance", Label: "财务管理", Sub: []MenuItem{
			{ID: "park-account", Label: "园区账户", Page: "park-account"},
			{ID: "withdraw", Label: "提现管理", Page: "withdraw"},
			{ID: "reconcile", Label: "对账单", Page: "reconcile"},
		}},
		{ID: "gates", Label: "闸机管理", Sub: []MenuItem{
			{ID: "gate-list", Label: "闸机列表", Page: "gate-list"},
			{ID: "face-list", Label: "人脸管理", Page: "face-list"},
			{ID: "entry-records", Label: "进出记录", Page: "entry-records"},
		}},
		{ID: "activities", Label: "活动管理", Sub: []MenuItem{
			{ID: "activity-list", Label: "活动列表", Page: "activity-list"},
			{ID: "activity-create", Label: "创建活动", Page: "activity-create"},
		}},
		{ID: "mp-client", Label: "客户端", Page: "mp-client-mgmt"},
		{ID: "mp-merchant", Label: "商户端", Page: "mp-merchant-mgmt"},
		{ID: "mp-admin", Label: "管理端", Page: "mp-admin-mgmt"},
		{ID: "permissions", Label: "权限管理", Sub: []MenuItem{
			{ID: "role-perm", Label: "角色权限", Page: "role-perm"},
		}},
		{ID: "employees", Label: "员工管理", Sub: []MenuItem{
			{ID: "employee-list", Label: "员工列表", Page: "employee-list"},
			{ID: "position-list", Label: "岗位管理", Page: "position-list"},
		}},
		{ID: "settings", Label: "系统设置", Sub: []MenuItem{
			{ID: "mp-config", Label: "小程序配置", Page: "mp-config"},
			{ID: "logs", Label: "操作日志", Page: "logs"},
		}},
	}

	return s.filterMenu(fullMenu, visibility)
}

func (s *RBACService) filterMenu(items []MenuItem, visibility map[string]bool) []MenuItem {
	var result []MenuItem
	for _, item := range items {
		if !visibility[item.ID] {
			continue
		}
		if len(item.Sub) > 0 {
			filtered := s.filterMenu(item.Sub, visibility)
			if len(filtered) > 0 {
				item.Sub = filtered
				result = append(result, item)
			}
		} else {
			result = append(result, item)
		}
	}
	return result
}

// GetRoleByCode 根据角色编码查询角色信息
func (s *RBACService) GetRoleByCode(code string) (*model.Role, error) {
	log.Printf("[RBACService] GetRoleByCode called, code: %s", code)
	return s.repo.GetRoleByCode(code)
}

// ListRoles 获取所有角色列表
func (s *RBACService) ListRoles() ([]model.Role, error) {
	log.Printf("[RBACService] ListRoles called")
	return s.repo.ListRoles()
}

type PermissionGroup struct {
	Module  string               `json:"module"`
	Actions []PermissionAction   `json:"actions"`
}

type PermissionAction struct {
	ID     int64  `json:"id"`
	Action string `json:"action"`
	Label  string `json:"label"`
}

// GetAllPermissions 获取所有权限并按模块分组，用于权限管理页面
func (s *RBACService) GetAllPermissions() ([]PermissionGroup, error) {
	log.Printf("[RBACService] GetAllPermissions called")
	perms, err := s.repo.ListAllPermissions()
	if err != nil {
		log.Printf("[RBACService] GetAllPermissions failed: %v", err)
		return nil, err
	}
	groups := make(map[string][]PermissionAction)
	for _, p := range perms {
		groups[p.Module] = append(groups[p.Module], PermissionAction{ID: p.ID, Action: p.Action, Label: p.Label})
	}
	var result []PermissionGroup
	for _, mod := range []string{"parks", "shops", "users", "orders", "finance", "employees", "gates", "activities", "meituan", "douyin", "rbac", "settings", "logs"} {
		if actions, ok := groups[mod]; ok {
			result = append(result, PermissionGroup{Module: mod, Actions: actions})
		}
	}
	log.Printf("[RBACService] GetAllPermissions succeeded: %d groups returned", len(result))
	return result, nil
}

// GetRolePermissions 获取指定角色已绑定的权限ID列表
func (s *RBACService) GetRolePermissions(roleID int64) ([]int64, error) {
	log.Printf("[RBACService] GetRolePermissions called, roleID: %d", roleID)
	return s.repo.GetPermissionIDsByRole(roleID)
}

// UpdateRolePermissions 更新角色权限绑定（先删除旧绑定再插入新绑定）
func (s *RBACService) UpdateRolePermissions(roleID int64, permIDs []int64) error {
	log.Printf("[RBACService] UpdateRolePermissions called, roleID: %d, permIDs: %v", roleID, permIDs)
	if err := s.repo.SetRolePermissions(roleID, permIDs); err != nil {
		log.Printf("[RBACService] UpdateRolePermissions failed: %v", err)
		return err
	}
	log.Printf("[RBACService] UpdateRolePermissions succeeded: role %d updated with %d permissions", roleID, len(permIDs))
	return nil
}
