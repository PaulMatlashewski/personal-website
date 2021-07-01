import React, { useState } from 'react'
import { SettingsButton, PaintbrushButton, EraserButton } from './buttons/buttons'
import Menu from './menu/menu'
import { toolbar, toolbarList } from './toolbar.module.css'

const Toolbar = props => {
  const [menuOpen, toggleMenuOpen] = useState(false);

  return (
    <nav className={toolbar}>
      <ul className={toolbarList}>
        <PaintbrushButton />
        <EraserButton />
        <SettingsButton onClick={() => toggleMenuOpen(!menuOpen)}/>
        {menuOpen ? <Menu simParams={props.simParams} /> : null}
      </ul>
    </nav>
  )
}

export default Toolbar;
