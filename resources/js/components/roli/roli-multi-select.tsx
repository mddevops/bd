import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxItem,
    ComboboxList,
    ComboboxValue,
    useComboboxAnchor,
} from '@/components/ui/combobox';
import { SELECT_MAX_ITEMS } from '@/lib/select-limit';
import { cn } from '@/lib/utils';

export interface RolOpciya {
    id: number;
    name: string;
    otobrazhaemoe_imya: string;
}

interface Props {
    label?: string;
    options: RolOpciya[];
    value: number[];
    onChange: (value: number[]) => void;
    error?: string;
    placeholder?: string;
}

export function RoliMultiSelect({
    label = 'Роли',
    options,
    value,
    onChange,
    error,
    placeholder = 'Выберите роли',
}: Props) {
    const anchor = useComboboxAnchor();
    const selected = options.filter((rol) => value.includes(rol.id));

    return (
        <div className="grid content-start gap-2">
            <Label>{label}</Label>

            <Combobox
                multiple
                items={options}
                value={selected}
                onValueChange={(next) => onChange(next.map((rol) => rol.id))}
                itemToStringLabel={(rol) => rol.otobrazhaemoe_imya}
                isItemEqualToValue={(left, right) => left.id === right.id}
                limit={SELECT_MAX_ITEMS}
            >
                <ComboboxChips ref={anchor} className={cn('w-full', error && 'border-destructive')}>
                    <ComboboxValue>
                        {(values: RolOpciya[]) => (
                            <>
                                {values.map((rol) => (
                                    <ComboboxChip key={rol.id} aria-label={rol.otobrazhaemoe_imya}>
                                        {rol.otobrazhaemoe_imya}
                                    </ComboboxChip>
                                ))}
                                <ComboboxChipsInput placeholder={values.length > 0 ? 'Поиск роли…' : placeholder} />
                            </>
                        )}
                    </ComboboxValue>
                </ComboboxChips>

                <ComboboxContent anchor={anchor}>
                    <ComboboxEmpty>Ничего не найдено</ComboboxEmpty>
                    <ComboboxList>
                        {(rol: RolOpciya) => (
                            <ComboboxItem key={rol.id} value={rol}>
                                {rol.otobrazhaemoe_imya}
                            </ComboboxItem>
                        )}
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>

            <InputError message={error} />
        </div>
    );
}
