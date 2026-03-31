import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

// Login route
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: "Username and password are required" });
      return;
    }

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      res.status(401).json({ message: "Invalid username or password" });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      res.status(401).json({ message: "Invalid username or password" });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get current user (protected route)
router.get("/me", authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Logout (client-side token removal, but we can add token blacklisting later)
router.post("/logout", authenticateToken, (_req: AuthRequest, res: Response): void => {
  res.json({ message: "Logged out successfully" });
});

export default router;
