import { PropsWithChildren } from "react"

type ModalProps = PropsWithChildren & {
  isVisible: boolean,
  title?: string,
  onClose(): void,
}

export const Modal = ({ isVisible, title, children, onClose }: ModalProps) => {
  if (!isVisible) return null;
  return <div className="modal-backdrop">
    <div className="modal-container">
      {title && <div className="modal-title">
        {title}
        <button className="close" onClick={onClose} />
      </div>}
      <div className="modal-content">
        {children}
      </div>
    </div>
  </div>;
}