import { useEffect, type Dispatch, type SetStateAction } from "react";

const DinamycForm = (
    {children, title, isOpen, setIsOpen, size}:
    {
        children: React.ReactNode;
        title: string;
        isOpen: boolean;
        setIsOpen: Dispatch<SetStateAction<boolean>>;
        size?: 'md' | 'sm' | 'lg' | 'xl'
    }
) => {

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, setIsOpen]);

    if (!isOpen) return null;
    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    }

    return (
        <div className="inset-0 fixed z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm duration-200
                animate-fade-out-form-modal"
                onClick={() => setIsOpen(false)} />
            <div
                className={`relative bg-background-dark rounded-xl shadow-blur-for-shadows w-full
                ${sizeClasses[size || 'md']}
                max-h-[90vh] overflow-hidden flex flex-col
                animate-fade-in-form-modal duration-200
                `}>
                <div
                    className="flex items-center justify-between px-6 py-4 border-b border-color-border-card shadow-card">
                    <h3 className="text-xl font-semibold text-color-text-general">
                        {title}
                    </h3>
                    <button
                        className="bg-background-emojis-color-alert hover:bg-color-bg-danger rounded-lg p-2 transition-colors"
                        type="button"
                        onClick={() => setIsOpen(false)}
                        aria-label="cancelar">
                        <i className="fa-solid fa-x text-color-text-danger hover:text-color-text-button ease-in duration-100 text-xl"/>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-4"> 
                    {children}
                </div>
            </div>
        </div>
    );
}

export default DinamycForm;
