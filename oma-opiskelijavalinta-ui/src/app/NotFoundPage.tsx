import { OphButton } from '@opetushallitus/oph-design-system';
import React from 'react';
import { Link } from 'react-router';

const NotFoundPage = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '10vh' }}>
      <h1>Sivua ei löytynyt</h1>
      <OphButton to="/" component={Link} variant="contained">
        Mene etusivulle
      </OphButton>
    </div>
  );
};

export default NotFoundPage;
