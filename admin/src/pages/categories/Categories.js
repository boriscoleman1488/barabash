import React from 'react';
import { Typography, Box } from '@mui/material';

export default function Categories() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Управління категоріями
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Тут буде список категорій та можливості їх редагування
      </Typography>
    </Box>
  );
}