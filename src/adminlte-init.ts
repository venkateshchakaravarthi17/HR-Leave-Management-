// src/adminlte-init.ts
export function initAdminLTEWidgets(): void {
  setTimeout(() => {
    const $ = (window as any).$;

    if ($ && $.fn && $.fn.PushMenu) {
      // Initialize PushMenu manually
      $('[data-widget="pushmenu"]').each(function (this: HTMLElement) {
        const $this = $(this);
        $this.off('click').on('click', function (e: any) {
          e.preventDefault();

          // Create and toggle PushMenu
          const pushMenu = new ($ as any).AdminLTE.PushMenu($('[data-widget="pushmenu"]').data());
          pushMenu.toggle();
        });
      });

      console.log('✅ AdminLTE PushMenu initialized successfully');
    } else {
      console.warn('⚠️ PushMenu not found — make sure AdminLTE JS is loaded');
    }
  }, 500);
}
