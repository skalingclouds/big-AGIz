import * as React from 'react';

import { Option, Select } from '@mui/joy';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import { useUIPreferencesStore } from '~/common/stores/store-ui';


// languages are defined as a JSON file
import languages from './Languages.json';


export function LanguageSelect() {
  // external state

  const preferredLanguage = useUIPreferencesStore(state => state.preferredLanguage);

  const handleLanguageChanged = (_event: any, newValue: string | null) => {
    if (!newValue) return;
    useUIPreferencesStore.getState().setPreferredLanguage(newValue as string);

    // NOTE: disabled, to make sure the code can be adapted at runtime - will re-enable to trigger translations, if not dynamically switchable
    //if (isBrowser)
    //  window.location.reload();
  };

  const languageOptions = React.useMemo(() => Object.entries(languages).map(([language, localesOrCode]) =>
    typeof localesOrCode === 'string'
      ? (
        <Option key={localesOrCode} value={localesOrCode}>
          {language}
        </Option>
      ) : (
        Object.entries(localesOrCode).map(([country, code]) => (
          <Option key={code} value={code}>
            {`${language} (${country})`}
          </Option>
        ))
      )), []);

  return (
    <Select value={preferredLanguage} onChange={handleLanguageChanged}
            indicator={<KeyboardArrowDownIcon />}
            slotProps={{
              root: { sx: { minWidth: 200 } },
              indicator: { sx: { opacity: 0.5 } },
            }}>
      {languageOptions}
    </Select>
  );
}