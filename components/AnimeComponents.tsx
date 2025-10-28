// This file is intentionally left empty or with minimal content
// as its components (AnimeCard, AnimeCarousel) have been refactored and
// moved to more specific locations:
// - `components/shared/AnimeCard.tsx`
// - `components/home/AnimeSection.tsx`

// Keeping the file prevents import errors in other components that might
// not have been updated yet, though ideally all imports should be redirected.

import React from 'react';

// You can add a placeholder component if needed to avoid build errors.
export const DeprecatedAnimeComponents: React.FC = () => {
    return (
        <div style={{ display: 'none' }}>
            This component is deprecated. Please use components from `components/shared` or `components/home`.
        </div>
    );
};
