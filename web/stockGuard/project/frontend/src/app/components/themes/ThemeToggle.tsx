import { useThemeStore } from "@/store/theme.store";

function ToggleTheme () {
    const {theme, toggleTheme} = useThemeStore();

    return (
        <button
            className={``}
            aria-label="cambiar tema">

        </button>
    );
}