package main

import (
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

	app.All("*", func(c *fiber.Ctx) error {
		return c.SendString("this will eventually serve the app")
	})

	app.Listen("127.0.0.1:8000")
}
