import * as React from 'react';
import { fileSave } from 'browser-fs-access';

import { Box, Button, Card, CardContent, Typography } from '@mui/joy';
import DownloadIcon from '@mui/icons-material/Download';

import { AppPlaceholder } from '../../src/apps/AppPlaceholder';

import { getBackendCapabilities } from '~/modules/backend/store-backend-capabilities';
import { getPlantUmlServerUrl } from '~/modules/blocks/code/code-renderers/RenderCodePlantUML';

import { withNextJSPerPageLayout } from '~/common/layout/withLayout';


// basics
import { Brand } from '~/common/app.config';
import { ROUTE_APP_CHAT, ROUTE_INDEX } from '~/common/app.routes';
import { Release } from '~/common/app.release';

// capabilities access
import { useCapabilityBrowserSpeechRecognition, useCapabilityElevenLabs, useCapabilityTextToImage } from '~/common/components/useCapabilities';

// stores access
import { getLLMsDebugInfo } from '~/common/stores/llms/store-llms';
import { useChatStore } from '~/common/stores/chat/store-chats';
import { useFolderStore } from '~/common/stores/folders/store-chat-folders';
import { useLogicSherpaStore } from '~/common/logic/store-logic-sherpa';
import { useUXLabsStore } from '~/common/stores/store-ux-labs';

// utils access
import { BrowserLang, clientHostName, Is, isPwa } from '~/common/util/pwaUtils';
import { getGA4MeasurementId } from '~/common/components/3rdparty/GoogleAnalytics';
import { prettyTimestampForFilenames } from '~/common/util/timeUtils';
import { supportsClipboardRead } from '~/common/util/clipboardUtils';
import { supportsScreenCapture } from '~/common/util/screenCaptureUtils';


function DebugCard(props: { title: string, children: React.ReactNode }) {
  return (
    <Box>
      <Typography level='title-lg'>
        {props.title}
      </Typography>
      {props.children}
    </Box>
  );
}

function prettifyJsonString(jsonString: string, deleteChars: number, removeDoubleQuotes: boolean, removeTrailComma: boolean): string {
  return jsonString.split('\n').map(l => {
    if (deleteChars > 0)
      l = l.substring(deleteChars);
    if (removeDoubleQuotes)
      l = l.replaceAll('\"', '');
    if (removeTrailComma && l.endsWith(','))
      l = l.substring(0, l.length - 1);
    return l;
  }).join('\n').trim();
}

function DebugJsonCard(props: { title: string, data: any }) {
  return (
    <DebugCard title={props.title}>
      <Typography level='body-sm' sx={{ whiteSpace: 'break-spaces', fontFamily: 'code', fontSize: { xs: 'xs' } }}>
        {prettifyJsonString(JSON.stringify(props.data, null, 2), 2, true, true)}
      </Typography>
    </DebugCard>
  );
}


const frontendBuild = Release.buildInfo('frontend');

function AppDebug() {

  // state
  const [saved, setSaved] = React.useState(false);

  // external state
  const backendCaps = getBackendCapabilities();
  const chatsCount = useChatStore.getState().conversations?.length;
  const uxLabsExperiments = Object.entries(useUXLabsStore.getState()).filter(([_k, v]) => v === true).map(([k, _]) => k).join(', ');
  const { folders, enableFolders } = useFolderStore.getState();
  const { lastSeenNewsVersion, usageCount } = useLogicSherpaStore.getState();

  // derived state
  const cClient = {
    // isBrowser,
    Is,
    BrowserLang,
    isPWA: isPwa(),
    supportsClipboardPaste: supportsClipboardRead(),
    supportsScreenCapture,
  };
  const cProduct = {
    capabilities: {
      mic: useCapabilityBrowserSpeechRecognition(),
      elevenLabs: useCapabilityElevenLabs(),
      textToImage: useCapabilityTextToImage(),
    },
    models: getLLMsDebugInfo(),
    state: {
      chatsCount,
      foldersCount: folders?.length,
      foldersEnabled: enableFolders,
      newsCurrent: Release.Monotonics.NewsVersion,
      newsSeen: lastSeenNewsVersion,
      labsActive: uxLabsExperiments,
      reloads: usageCount,
    },
    release: {
      app: Release.App,
      build: frontendBuild,
    },
  };
  const cBackend = {
    configuration: backendCaps,
    deployment: {
      home: Brand.URIs.Home,
      hostName: clientHostName(),
      measurementId: getGA4MeasurementId(),
      plantUmlServerUrl: getPlantUmlServerUrl(),
      routeIndex: ROUTE_INDEX,
      routeChat: ROUTE_APP_CHAT,
    },
  };

  const handleDownload = async () => {
    fileSave(
      new Blob([JSON.stringify({ client: cClient, agi: cProduct, backend: cBackend }, null, 2)], { type: 'application/json' }),
      { fileName: `big-agi_debug_${prettyTimestampForFilenames()}.json`, extensions: ['.json'] },
    )
      .then(() => setSaved(true))
      .catch(e => console.error('Error saving debug.json', e));
  };

  return (
    <AppPlaceholder title={`${Brand.Title.Common} Debug`}>
      <Box sx={{ display: 'grid', gap: 3, my: 3 }}>
        <Button
          variant={saved ? 'soft' : 'outlined'} color={saved ? 'success' : 'neutral'}
          onClick={handleDownload}
          endDecorator={<DownloadIcon />}
          sx={{
            backgroundColor: saved ? undefined : 'background.surface',
            boxShadow: 'sm',
            placeSelf: 'start',
            minWidth: 260,
          }}
        >
          Download debug JSON
        </Button>
        <Card>
          <CardContent sx={{ display: 'grid', gap: 3 }}>
            <DebugJsonCard title='Client' data={cClient} />
            <DebugJsonCard title='AGI' data={cProduct} />
            <DebugJsonCard title='Backend' data={cBackend} />
          </CardContent>
        </Card>
      </Box>
    </AppPlaceholder>
  );
}


export default withNextJSPerPageLayout({ type: 'container' }, () => <AppDebug />);
