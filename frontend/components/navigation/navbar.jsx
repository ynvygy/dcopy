import { ConnectButton } from "@rainbow-me/rainbowkit";
import React, { useState } from 'react';
import styles from "../../styles/Navbar.module.css";

export default function Navbar() {
	const [isLogoClicked, setIsLogoClicked] = useState(false);

	const handleLogoClick = () => {
		event.preventDefault();
    setIsLogoClicked(!isLogoClicked);
  };

	return (
		<nav className={styles.navbar}>
      <a href="#" target="_blank" onClick={handleLogoClick}>
        <img
          className={`${styles.alchemy_logo} ${isLogoClicked ? styles.enlarged : ''}`}
          src="/logo.png"
          alt="Logo"
        />
      </a>
			<ConnectButton></ConnectButton>
		</nav>
	);
}
