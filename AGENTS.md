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

- Nature appearance is controlled by semantic CSS tokens and a root data-nature-theme attribute, with visitor choice restored after hydration; this keeps SSR stable and all pages consistent.
- Scroll atmosphere, the palette popover, and persistent mouse-interaction preference live in NatureThemes; DotGrid observes root attributes without changing dot geometry, keeping SSR stable.
- Product visibility uses a dedicated flag separate from stock: public queries and read policies exclude hidden products, while existing admin role policies retain management access.

- Homepage product imagery uses Embla in ProductCarousel with client-randomized public images, first-click detail reveal and second-click product navigation; this preserves touch dragging and avoids custom carousel physics.
- Public account UI is removed; admin authentication remains self-contained at /admin so shop management stays available.
- Product grids use fixed-ratio media and flex-column metadata with a common minimum height so varying names and collection labels do not misalign cards.
