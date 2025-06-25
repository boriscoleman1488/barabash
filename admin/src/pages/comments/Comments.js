import React from 'react';
import { Typography, Box } from '@mui/material';

export default function Comments() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Управління коментарями
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Тут буде список коментарів та можливості їх модерації
      </Typography>
    </Box>
  );
}