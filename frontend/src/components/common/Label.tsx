import { Text } from '@chakra-ui/react';
import React from 'react';
import theme from '../../theme';
interface LabelItemProps {
  label: string;
  required?: boolean;
}
const LabelItem = React.memo(({ label, required = false }: LabelItemProps) => {
  return (
    <Text fontWeight={500} color={theme.colors.primaryText} fontSize={13} mb={1}>
      {label}{' '}
      {required && (
        <Text as="span" color="red.500">
          *
        </Text>
      )}
    </Text>
  );
});
export default LabelItem;
