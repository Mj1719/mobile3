document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".hamburger");
  const drawer = document.querySelector(".mobile-drawer");
  if (!btn || !drawer) return;

  const setOpen = (open) => {
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    drawer.hidden = !open;
  };

  setOpen(false);

  btn.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") === "true";
    setOpen(!open);
  });

  drawer.addEventListener("click", (e) => {
    if (e.target.tagName === "A") setOpen(false);
  });
});

// Prevent iOS Safari double-tap zoom inside the wheel region
document.addEventListener("DOMContentLoaded", () => {
  const stage = document.getElementById("wheel-stage");
  if (!stage) return;

  let lastTouchEnd = 0;
  stage.addEventListener("touchend", (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });
});
