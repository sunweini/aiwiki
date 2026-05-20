package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
	"gopkg.in/yaml.v3"
)

type Config struct {
	App      AppConfig      `yaml:"app"`
	Database DatabaseConfig `yaml:"database"`
	Redis    RedisConfig    `yaml:"redis"`
	JWT      JWTConfig      `yaml:"jwt"`
	WeChat   WeChatConfig   `yaml:"wechat"`
}

type AppConfig struct {
	Port   int    `yaml:"port"`
	Env    string `yaml:"env"`
	Secret string `yaml:"secret"`
}

type DatabaseConfig struct {
	Host         string `yaml:"host"`
	Port         int    `yaml:"port"`
	User         string `yaml:"user"`
	Password     string `yaml:"password"`
	DBName       string `yaml:"dbname"`
	MaxIdleConns int    `yaml:"max_idle_conns"`
	MaxOpenConns int    `yaml:"max_open_conns"`
}

type RedisConfig struct {
	Host     string `yaml:"host"`
	Port     int    `yaml:"port"`
	Password string `yaml:"password"`
	DB       int    `yaml:"db"`
}

type JWTConfig struct {
	Secret            string `yaml:"secret"`
	ExpireHours       int    `yaml:"expire_hours"`
	RefreshExpireHours int   `yaml:"refresh_expire_hours"`
}

type WeChatConfig struct {
	AppID     string `yaml:"app_id"`
	AppSecret string `yaml:"app_secret"`
}

var C *Config

// Load reads config.yaml and overrides with environment variables.
func Load() error {
	// Load .env file if it exists (best-effort)
	_ = godotenv.Load()

	data, err := os.ReadFile("config.yaml")
	if err != nil {
		return err
	}

	C = &Config{}
	if err := yaml.Unmarshal(data, C); err != nil {
		return err
	}

	// Override with environment variables
	if v := os.Getenv("APP_PORT"); v != "" {
		if p, err := strconv.Atoi(v); err == nil {
			C.App.Port = p
		}
	}
	if v := os.Getenv("APP_ENV"); v != "" {
		C.App.Env = v
	}
	if v := os.Getenv("APP_SECRET"); v != "" {
		C.App.Secret = v
	}

	if v := os.Getenv("DB_HOST"); v != "" {
		C.Database.Host = v
	}
	if v := os.Getenv("DB_PORT"); v != "" {
		if p, err := strconv.Atoi(v); err == nil {
			C.Database.Port = p
		}
	}
	if v := os.Getenv("DB_USER"); v != "" {
		C.Database.User = v
	}
	if v := os.Getenv("DB_PASSWORD"); v != "" {
		C.Database.Password = v
	}
	if v := os.Getenv("DB_NAME"); v != "" {
		C.Database.DBName = v
	}

	if v := os.Getenv("REDIS_HOST"); v != "" {
		C.Redis.Host = v
	}
	if v := os.Getenv("REDIS_PORT"); v != "" {
		if p, err := strconv.Atoi(v); err == nil {
			C.Redis.Port = p
		}
	}

	if v := os.Getenv("JWT_SECRET"); v != "" {
		C.JWT.Secret = v
	}
	if v := os.Getenv("JWT_EXPIRE_HOURS"); v != "" {
		if p, err := strconv.Atoi(v); err == nil {
			C.JWT.ExpireHours = p
		}
	}
	if v := os.Getenv("JWT_REFRESH_EXPIRE_HOURS"); v != "" {
		if p, err := strconv.Atoi(v); err == nil {
			C.JWT.RefreshExpireHours = p
		}
	}

	if v := os.Getenv("WECHAT_APP_ID"); v != "" {
		C.WeChat.AppID = v
	}
	if v := os.Getenv("WECHAT_APP_SECRET"); v != "" {
		C.WeChat.AppSecret = v
	}

	return nil
}
