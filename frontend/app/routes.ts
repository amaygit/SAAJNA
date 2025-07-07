import { type RouteConfig, route, layout, index } from "@react-router/dev/routes";

export default [
    layout("routes/auth/auth-layout.tsx",[
        index("routes/root/home.tsx"),
        route("sign-in","routes/auth/sign-in.tsx"),
        route("sign-up","routes/auth/sign-up.tsx"),
        route("forgot-password","routes/auth/forgot-password.tsx"),
        route("rest-password","routes/auth/reset-password.tsx"),
        route("verify-email","routes/auth/verify-email.tsx"),
    ]),
    layout("routes/dashboard/dashboard-layout.tsx",[
        route("dashboard","routes/dashboard/index.tsx"),
    ]),
] satisfies RouteConfig;
