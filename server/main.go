package main

import (
	"cmp"
	"fmt"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	app := fiber.New()

	app.Use(logger.New())

	api := app.Group("/api")
	api.Get("/users", func(c *fiber.Ctx) error {
		return c.JSON([]map[string]any{
			{
				"id":   1,
				"name": "Joshua",
				"age":  23,
			},
			{
				"id":   2,
				"name": "Natalie",
				"age":  21,
			},
		})
	})

	const five_minutes = time.Second * 60 * 5
	app.Static("/", "./dist", fiber.Static{
		CacheDuration: five_minutes,
	})

	addr := fmt.Sprintf("0.0.0.0:%s", cmp.Or(os.Getenv("PORT"), "8080"))
	app.Listen(addr)
}
