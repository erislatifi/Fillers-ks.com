import React from "react";
import { Mark } from "./Logo";

/** Brand half of the split-screen login. Positioned fixed by custom.scss; hidden on small screens. */
export function LoginPanel() {
  return (
    <>
      <div className="fk-login-heading">
        <h1>Mirë se u ktheve</h1>
        <p>Hyr me email-in dhe fjalëkalimin e administratorit.</p>
      </div>
      <Panel />
    </>
  );
}

function Panel() {
  return (
    <aside className="fk-login-panel" aria-hidden>
      <div className="fk-login-panel__glow fk-login-panel__glow--a" />
      <div className="fk-login-panel__glow fk-login-panel__glow--b" />
      <div className="fk-login-panel__watermark">
        <Mark size={420} />
      </div>

      <div className="fk-login-panel__top">
        <Mark size={34} />
        <span>
          Fillers <small>Kosovo</small>
        </span>
      </div>

      <div className="fk-login-panel__body">
        <p className="fk-login-panel__eyebrow">Paneli i administrimit</p>
        <h2>Katalogu, porositë dhe faqja — nën kontrollin tënd.</h2>
        <p className="fk-login-panel__lead">
          Shto produkte, ndrysho çmime dhe foto, dhe konfirmo kërkesat e klinikave nga një vend i vetëm. Pa kod, në
          shqip dhe anglisht.
        </p>
        <ul className="fk-login-panel__list">
          <li>Produkte, brende dhe kategori</li>
          <li>Porosi nga klinikat, me datë dorëzimi</li>
          <li>Ballina, promocionet dhe artikujt</li>
        </ul>
      </div>

      <p className="fk-login-panel__foot">Ndriço me ne!</p>
    </aside>
  );
}
