package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"yfsc-platform-v2/backend/internal/config"
	"github.com/redis/go-redis/v9"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB
var RDB *redis.Client

func MustConnect() *gorm.DB {
	c := config.C.Database
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		c.User, c.Password, c.Host, c.Port, c.DBName)

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatal("Failed to connect to MySQL: ", err)
	}

	sqlDB, _ := DB.DB()
	sqlDB.SetMaxIdleConns(c.MaxIdleConns)
	sqlDB.SetMaxOpenConns(c.MaxOpenConns)
	sqlDB.SetConnMaxLifetime(time.Hour)

	return DB
}

func MustConnectRedis() *redis.Client {
	c := config.C.Redis
	RDB = redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%d", c.Host, c.Port),
		Password: c.Password,
		DB:       c.DB,
	})

	ctx := context.Background()
	if err := RDB.Ping(ctx).Err(); err != nil {
		log.Fatal("Failed to connect to Redis: ", err)
	}

	return RDB
}
