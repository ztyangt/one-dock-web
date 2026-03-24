import type {
  LocationQueryRaw,
  RouteLocationNormalizedGeneric,
  RouteLocationNormalizedLoadedGeneric,
  NavigationGuardNext,
} from "vue-router";
import type { Router } from "vue-router";

const jumpLogin = (to: RouteLocationNormalizedGeneric, from: RouteLocationNormalizedLoadedGeneric, next: NavigationGuardNext) => {
  if (to.meta.needLogin) {
    next({
      name: "login",
      query: {
        redirect: encodeURIComponent(to.fullPath),
        ...to.query,
      } as LocationQueryRaw,
    });
  } else next();
};

export default function setupUserLoginInfoGuard(router: Router) {
  router.beforeEach((to, from, next) => {
    const userStore = useUserStore();
    if (userStore.hasLogin) {
      if (to.name === "login" || to.name === "Login") next({ name: "Admin" });
      else next();
    } else {
      if (to.name === "login" || to.name === "Login") next();
      else jumpLogin(to, from, next);
    }
  });
}
