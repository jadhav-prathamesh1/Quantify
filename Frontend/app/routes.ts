import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/login", "features/auth/pages/Login.tsx"),
  route("/signup", "features/auth/pages/Signup.tsx"),
  
  // Admin routes as separate top-level routes
  route("/admin", "routes/admin.tsx"),
  route("/admin/users", "routes/admin/users.tsx"),
  route("/admin/stores", "routes/admin/stores.tsx"),
  route("/admin/ratings", "routes/admin/ratings.tsx"),
  
  // Owner routes
  route("/owner", "routes/owner.tsx"),
  route("/owner/shops", "routes/owner/shops.tsx"),
  route("/owner/insights", "routes/owner/insights.tsx"),
  route("/owner/reviews", "routes/owner/reviews.tsx"),
  route("/owner/profile", "routes/owner/profile.tsx"),
  
  // User routes
  route("/user", "routes/user.tsx"),
  route("/user/stores", "routes/user/stores.tsx"),
  route("/user/stores/:id", "routes/user/store-detail.tsx"),
  route("/user/reviews", "routes/user/reviews.tsx"),
  route("/user/profile", "routes/user/profile.tsx"),
  
  route("/dashboard", "routes/dashboard.tsx"),
] satisfies RouteConfig;
