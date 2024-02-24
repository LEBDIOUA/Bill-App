import eyeBlueIcon from "../assets/svg/eye_blue.js"
import downloadBlueIcon from "../assets/svg/download_blue.js"

export default (fileUrl, fileUName) => {
  return (
    `<div class="icon-actions" style="display:flex; flex-direction:row; gap:10px; width: 100%; justify-content: space-between;">
      <div>${fileUName}</div>
      <div id="eye" data-testid="icon-eye" data-bill-url=${fileUrl}>
        ${eyeBlueIcon}
      </div>
    </div>`
  )
}