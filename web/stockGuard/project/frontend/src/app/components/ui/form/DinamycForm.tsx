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
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setIsOpen(false)} />
            <div
                className={`relative bg-background-dark`}>

            </div>
        </div>
    );
}

export default DinamycForm;
