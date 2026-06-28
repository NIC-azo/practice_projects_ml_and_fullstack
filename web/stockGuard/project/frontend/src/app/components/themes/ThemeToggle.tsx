import { useThemeStore } from "@/store/theme.store";

function ToggleTheme () {
    const {theme, toggleTheme} = useThemeStore();

    return (
        <button
            onClick={toggleTheme}
            type="button"
            className={`p-2 rounded-lg bg-background-emojis-color text-color-text-general hover:text-color-text-general/20
                transition-colors duration-150`}
            aria-label="cambiar tema">
            <i className={ theme === 'light' ? `fas fa-moon` : 'fas fa-sun'}/>
        </button>
    );
}

export default ToggleTheme;