import Image from 'next/image';
import toast from 'react-hot-toast';
import { useState } from 'react';

import Button from '@/components/reusables/Button/Button';
import Modal from '@/components/reusables/Modal/Modal';
import Switch from '@/components/reusables/Toggle/Switch';
import { constants } from '@/configs';

import CopySVG from 'public/svgs/copy-svg.svg';
import SharePicture from 'public/share.png';
import ShareLinkPicture from 'public/svgs/share-links.svg';
import QRCodePicture from 'public/svgs/qrcode-icon.svg';
import VCFFilePicture from 'public/svgs/vcfcard.svg';

import styles from './ShareCardModal.module.scss';

const c = 'share-card-modal';

interface ShareCardModalProps {
  uuid?: string;
  username?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
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
      <Modal open={open} setOpen={setOpen}>
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
              <button onClick={handleSaveOnlineQRCode} className={styles[`${c}-row-buttons`]}>
                <Image src={QRCodePicture} alt="link icon" />
              </button>
              <p className={styles[`${c}-row-text`]}>Save Online QR Code</p>
            </div>

            <div>
              <button onClick={handleSaveVcf} className={styles[`${c}-row-buttons`]}>
                <Image src={VCFFilePicture} alt="link icon" />
              </button>
              <p className={styles[`${c}-row-text`]}>VCF File</p>
            </div>

            <div>
              <button onClick={handleSaveOfflineQRCode} className={styles[`${c}-row-buttons`]}>
                <Image src={QRCodePicture} alt="link icon" />
              </button>
              <p className={styles[`${c}-row-text`]}>Save Offline QR Code</p>
            </div>

            <div>
              <button onClick={() => checked ? handleCopyQRSVG(onlineQRCodeURL) : handleCopyQRSVG(offlineQRCodeURL)} className={styles[`${c}-row-buttons`]}>
                <Image src={CopySVG} alt="link icon" width={50} />
              </button>
              <p className={styles[`${c}-row-text`]}>Copy { checked ? 'Online' : 'Offline' } QR SVG</p>
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
