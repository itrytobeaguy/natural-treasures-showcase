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
- Scroll atmosphere and the theme picker live in NatureThemes; dot geometry remains independent, while its colors resolve global theme tokens.
