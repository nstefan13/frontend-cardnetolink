import Image from 'next/image';
import toast from 'react-hot-toast';
import { EventHandler, MouseEventHandler, useState } from 'react';

import Button from '@/components/reusables/Button/Button';
import Modal from '@/components/reusables/Modal/Modal';
import Switch from '@/components/reusables/Toggle/Switch';
import { constants } from '@/configs';

import CopySVGPicture from 'public/svgs/copy-svg.svg';
import SharePicture from 'public/share.png';
import ShareLinkPicture from 'public/svgs/share-links.svg';
import QRCodePicture from 'public/svgs/qrcode-icon.svg';
import VCFFilePicture from 'public/svgs/vcfcard.svg';
import { Wifi } from 'lucide-react';
import { Download } from 'lucide-react';
import { Copy } from 'lucide-react';
import { WifiOff } from 'lucide-react';

import styles from './ShareCardModal.module.scss';

const c = 'share-card-modal';

interface ShareCardModalProps {
  uuid?: string;
  username?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

function SaveQRButton({ handleCopy, handleDownload }: {
  handleCopy : MouseEventHandler<HTMLButtonElement>,
  handleDownload: MouseEventHandler<HTMLButtonElement>
}) {
  return <div className={styles[`${c}-row-saveqr`]}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "6px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Image width={64} height={64} src={QRCodePicture} alt="link icon"/>
            </div>

            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "end" }}>
              <button className={styles[`${c}-actionbtn`]} onClick={handleCopy}>
                <Copy width={25} height={25}/>
              </button>
              <button className={styles[`${c}-actionbtn`]} onClick={handleDownload}>
                <Download width={25} height={25}/>
              </button>
            </div>
          </div>
        </div>;
}

export default function ShareCardModal({ uuid, username, open, setOpen }: ShareCardModalProps) {
  const [checked, setChecked] = useState(true);
  const onlineQRCodeURL = `${process.env.NEXT_PUBLIC_API_URL}/cards/${uuid}/qr-online-svg`;
  const offlineQRCodeURL = `${process.env.NEXT_PUBLIC_API_URL}/cards/${uuid}/qr-offline-svg`;

  if (!uuid) {
    return <></>;
  }

  const handleCopyUrl = () => {
    toast.success('Text copied to clipboard');
    navigator.clipboard.writeText(`${constants.appUrl}/${uuid}`);
  };

  const handleSaveOnlineQRCode = () => {
    window.open(`${constants.apiUrl}/cards/${uuid}/qr-online`);
    toast.success('Online QR Code saved');
  };

  const handleSaveOfflineQRCode = () => {
    window.open(`${constants.apiUrl}/cards/${uuid}/qr-offline`);
    toast.success('Offline QR Code saved');
  };

  const handleCopyQRSVG = async (url: string) => {
    const resp = await fetch(url);
    if (resp.status === 200) {
      window.navigator.clipboard.writeText(await resp.text());
      toast.success('Text copied to clipboard');
    }
  }

  const handleSaveVcf = () => {
    toast.success('URL copied to clipboard');
    navigator.clipboard.writeText(`${constants.apiUrl}/cards/${uuid}/vcf`);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  return (
    <>
      <Modal open={open} setOpen={setOpen} 
        modalComponentStyle={{
          maxWidth: '40%',
        }}
        paperComponentStyle={{
          maxWidth: '100%',
        }}
      >
        <div className={styles[`${c}-container`]}>
          <div className={styles[`${c}-column`]}>
            <Image src={SharePicture} alt="share icon" />
            <div className={styles[`${c}-column-text`]}>
              <p className={styles[`${c}-column-text-upper`]}>Share your Card</p>
              <p className={styles[`${c}-column-text-lower`]}>
                {username ? `cardneto.link/${username}` : 'Sharing is Caring.'}
              </p>
            </div>
            <Image
              src={checked ? onlineQRCodeURL : offlineQRCodeURL}
              unoptimized
              overrideSrc={checked ? onlineQRCodeURL : offlineQRCodeURL}
              width={210}
              height={210}
              quality={100}
              alt="qr code"
            />
            <div className={styles[`${c}-column-switch`]}>
              <p>{checked ? 'Online QR' : 'Offline QR'}</p>
              <Switch checked={checked} onChange={() => setChecked(!checked)} />
            </div>
          </div>

          <div className={styles[`${c}-row`]}>
            <div>
              <button onClick={handleCopyUrl} className={styles[`${c}-row-buttons`]}>
                <Image src={ShareLinkPicture} alt="link icon" />
              </button>
              <p className={styles[`${c}-row-text`]}>URL</p>
            </div>

            <div>
              <SaveQRButton
                handleCopy={() => handleCopyQRSVG(onlineQRCodeURL)}
                handleDownload={handleSaveOnlineQRCode}
              />
              <div className={styles[`${c}-row-text`]}>
                <Wifi width={'1em'} height={'1em'} style={{ verticalAlign: "-0.1em", marginRight: "2px" }}/>
                <span>Online QR</span>
              </div>
            </div>

            <div>
              <button onClick={handleSaveVcf} className={styles[`${c}-row-buttons`]}>
                <Image src={VCFFilePicture} alt="link icon" />
              </button>
              <p className={styles[`${c}-row-text`]}>VCF File</p>
            </div>

            <div>
              <SaveQRButton
                handleCopy={() => handleCopyQRSVG(offlineQRCodeURL)}
                handleDownload={handleSaveOfflineQRCode}
              />
              <div className={styles[`${c}-row-text`]}>
                <WifiOff width={'1em'} height={'1em'} style={{ verticalAlign: "-0.1em", marginRight: "2px" }}/>
                <span>Offline QR</span>
              </div>
            </div>
          </div>

          <Button onClick={handleCloseModal} fullWidth variant="contained">
            Done
          </Button>
        </div>
      </Modal>
    </>
  );
}
