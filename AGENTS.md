<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the native TanStack index route as the storefront entry and the store-specific UI under `src/components/store`; this preserves routing and separates retail presentation from state.
- Preserve the imported browser-only, manual WhatsApp commerce model for visual redesigns; shared administration and hosted order persistence require a separate Cloud implementation.
- Restore browser storage only after hydration, and gate persistence until restoration completes; this prevents mismatched rendering and lost cached carts.
- Serve product and banner images as real files under public/images; the store is also deployed to Cloudflare Pages, where asset-pointer URLs 404.
- Use uncropped contain-fit product imagery with a shared gallery class and stable catalogue frames; this preserves garment details across cards, galleries and cart thumbnails.
