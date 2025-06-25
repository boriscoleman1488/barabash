import React from 'react';
import { Typography, Box } from '@mui/material';

export default function Users() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Управління користувачами
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Тут буде список користувачів та можливості їх управління
      </Typography>
    </Box>
  );
}