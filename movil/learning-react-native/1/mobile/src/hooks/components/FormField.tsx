import { View, Text, TextInput, type TextInputProps } from "react-native";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";

interface FormFieldProps<T extends FieldValues> extends TextInputProps {
  control: Control<T>;
  name: Path<T>;
  label: string;
}

export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  ...inputProps
}: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">{label}</Text>
          <TextInput
            className={`border rounded-lg px-3 py-2 text-base ${
              error ? "border-red-500" : "border-gray-300"
            }`}
            onChangeText={onChange}
            onBlur={onBlur}
            value={value as string}
            {...inputProps}
          />
          {error && <Text className="text-red-500 text-xs mt-1">{error.message}</Text>}
        </View>
      )}
    />
  );
}