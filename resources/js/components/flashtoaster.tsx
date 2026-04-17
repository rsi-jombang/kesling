import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function FlashToaster() {
    const { props } = usePage();

    useEffect(() => {
        const flash = props.flash as any;
        if (flash?.success) {
            toast.success(flash.success, {position: 'top-right'});
        }
        if (flash?.error) {
            toast.error(flash.error, {position: 'top-right'});
        }
        if (flash?.warning) {
            toast.warning(flash.warning, {position: 'top-right'});
        }
        if (flash?.info) {
            toast.info(flash.info, {position: 'top-right'});
        }
    }, [props.flash]);

    return null;
}
