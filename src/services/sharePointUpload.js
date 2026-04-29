const GRAPH = 'https://graph.microsoft.com/v1.0';
const SITE_HOST = 'apsisconsult.sharepoint.com';
const SITE_PATH = '/sites/Projetos';
const LIBRARY  = 'Secure Share';

async function getToken(msalInstance, accounts) {
  try {
    const r = await msalInstance.acquireTokenSilent({
      scopes: ['https://graph.microsoft.com/Files.ReadWrite.All'],
      account: accounts[0],
    });
    return r.accessToken;
  } catch {
    const r = await msalInstance.acquireTokenPopup({
      scopes: ['https://graph.microsoft.com/Files.ReadWrite.All'],
      account: accounts[0],
    });
    return r.accessToken;
  }
}

async function graphGet(url, token) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error?.message || `Graph ${res.status}: ${url}`);
  }
  return res.json();
}

async function getSiteId(token) {
  const data = await graphGet(`${GRAPH}/sites/${SITE_HOST}:${SITE_PATH}`, token);
  return data.id;
}

async function getDriveId(token, siteId) {
  const data = await graphGet(`${GRAPH}/sites/${siteId}/drives`, token);
  const drive = data.value.find(d => d.name === LIBRARY);
  if (!drive) throw new Error(`Biblioteca "${LIBRARY}" não encontrada no SharePoint.`);
  return drive.id;
}

async function ensureFolder(token, driveId, folderName) {
  const res = await fetch(`${GRAPH}/drives/${driveId}/root/children`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      folder: {},
      '@microsoft.graph.conflictBehavior': 'fail',
    }),
  });
  // 409 = já existe → ok, usamos a pasta existente
  if (!res.ok && res.status !== 409) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error?.message || `Erro ao criar pasta: ${res.status}`);
  }
}

async function uploadFile(token, driveId, folderName, file, onProgress) {
  const path = `${encodeURIComponent(folderName)}/${encodeURIComponent(file.name)}`;

  // Cria sessão de upload (suporta arquivos de qualquer tamanho)
  const sessionRes = await fetch(
    `${GRAPH}/drives/${driveId}/root:/${path}:/createUploadSession`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        item: { '@microsoft.graph.conflictBehavior': 'rename', name: file.name },
      }),
    }
  );
  if (!sessionRes.ok) {
    const body = await sessionRes.json().catch(() => ({}));
    throw new Error(body.error?.message || `Erro ao iniciar upload de "${file.name}"`);
  }
  const { uploadUrl } = await sessionRes.json();

  // Envia em chunks de 5 MB
  const CHUNK = 5 * 1024 * 1024;
  const total = file.size;
  let start = 0;

  while (start < total) {
    const end = Math.min(start + CHUNK, total);
    const chunk = file.slice(start, end);

    const putRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Range': `bytes ${start}-${end - 1}/${total}`,
        'Content-Length': String(end - start),
      },
      body: chunk,
    });

    // 200/201 = concluído, 202 = mais chunks esperados
    if (![200, 201, 202].includes(putRes.status)) {
      throw new Error(`Falha no upload de "${file.name}": ${putRes.status}`);
    }

    start = end;
    onProgress(Math.round((start / total) * 100));
  }
}

export async function uploadToSharePoint({ msalInstance, accounts, apos, empresa, files, onFileProgress }) {
  const token    = await getToken(msalInstance, accounts);
  const siteId   = await getSiteId(token);
  const driveId  = await getDriveId(token, siteId);
  const folder   = `${apos.replace(/[/\:*?"<>|]/g, "-")} - ${empresa}`;

  await ensureFolder(token, driveId, folder);

  for (const file of files) {
    await uploadFile(token, driveId, folder, file, pct => onFileProgress(file.name, pct));
  }

  return {
    folderName: folder,
    folderUrl: `https://apsisconsult.sharepoint.com/sites/Projetos/${encodeURIComponent(LIBRARY)}/${encodeURIComponent(folder)}`,
  };
}
