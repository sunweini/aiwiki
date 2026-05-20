package main

import (
	"database/sql"
	"fmt"
	"log"

	"yfsc-platform-v2/backend/internal/config"
	"yfsc-platform-v2/backend/internal/database"
	"yfsc-platform-v2/backend/internal/model"

	_ "github.com/go-sql-driver/mysql"
	"golang.org/x/crypto/bcrypt"
)

func ensureDatabaseExists() {
	c := config.C.Database
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/", c.User, c.Password, c.Host, c.Port)
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal("Failed to connect to MySQL: ", err)
	}
	defer db.Close()

	_, err = db.Exec("CREATE DATABASE IF NOT EXISTS " + c.DBName + " CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
	if err != nil {
		log.Fatal("Failed to create database: ", err)
	}
}

func main() {
	if err := config.Load(); err != nil {
		log.Fatal("Failed to load config: ", err)
	}

	ensureDatabaseExists()
	db := database.MustConnect()
	defer func() {
		sqlDB, _ := db.DB()
		sqlDB.Close()
	}()

	if err := database.RunMigrate(db); err != nil {
		log.Fatal("Failed to migrate: ", err)
	}

	// Seed roles
	roles := []model.Role{
		{Name: "平台超级管理员", Code: "ADMIN_PLATFORM", Layer: "总部", Description: "平台最高权限"},
		{Name: "总部运营", Code: "PLATFORM_OPER", Layer: "总部", Description: "查看所有园区数据"},
		{Name: "园区管理员", Code: "PARK_ADMIN", Layer: "园区", Description: "本园区所有管理权限"},
		{Name: "园区经理", Code: "PARK_MANAGER", Layer: "园区", Description: "本园区经营数据查看"},
		{Name: "商户管理员", Code: "SHOP_ADMIN", Layer: "商户", Description: "本店铺经营管理"},
		{Name: "商户收银员", Code: "SHOP_CASHIER", Layer: "商户", Description: "本店铺收银、核销"},
	}
	for _, role := range roles {
		db.Where(model.Role{Code: role.Code}).FirstOrCreate(&role)
	}

	// Seed admin employee (password: admin123)
	hashed, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	admin := model.Employee{
		Username:     "admin",
		PasswordHash: string(hashed),
		RealName:     "系统管理员",
		Role:         "ADMIN_PLATFORM",
		Status:       1,
	}
	db.Where(model.Employee{Username: "admin"}).FirstOrCreate(&admin)

	// Seed parks
	parks := []model.Park{
		{Name: "黄梅袁夫稻田", Code: "park-hm", Address: "湖北省黄冈市黄梅县", ContactName: "负责人", ContactPhone: "13800138000", Status: 1},
		{Name: "武汉袁夫稻田", Code: "park-wh", Address: "湖北省武汉市江夏区", ContactName: "负责人", ContactPhone: "13800138001", Status: 1},
	}
	for _, park := range parks {
		db.Where(model.Park{Code: park.Code}).FirstOrCreate(&park)
	}

	// Seed shop types
	types := []model.ShopType{
		{Name: "餐饮", Code: "food", Description: "餐饮服务", Status: 1},
		{Name: "零售", Code: "retail", Description: "商品零售", Status: 1},
		{Name: "体验", Code: "experience", Description: "体验项目", Status: 1},
		{Name: "其他", Code: "other", Description: "其他类型", Status: 1},
	}
	for _, t := range types {
		db.Where(model.ShopType{Code: t.Code}).FirstOrCreate(&t)
	}

	fmt.Println("Seed data complete!")
}
