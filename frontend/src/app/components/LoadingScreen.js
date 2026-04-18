'use client';

import styles from './LoadingScreen.module.css';

export default function LoadingScreen({ message = 'Cargando...' }) {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.animation}>
        {/* Nubes de fondo */}
        <div className={styles.cloud} style={{ top: '20%', left: '10%', animationDelay: '0s' }}></div>
        <div className={styles.cloud} style={{ top: '40%', right: '15%', animationDelay: '2s' }}></div>
        <div className={styles.cloud} style={{ top: '60%', left: '20%', animationDelay: '4s' }}></div>
        <div className={styles.cloud} style={{ top: '30%', right: '25%', animationDelay: '1s' }}></div>
        <div className={styles.cloud} style={{ top: '70%', left: '40%', animationDelay: '3s' }}></div>
        
        {/* Pingüino volando */}
        <div className={styles.penguinContainer}>
          <div className={styles.penguin}>
            {/* Cuerpo */}
            <div className={styles.body}>
              <div className={styles.belly}></div>
            </div>
            
            {/* Cabeza */}
            <div className={styles.head}>
              <div className={styles.eye + ' ' + styles.eyeLeft}></div>
              <div className={styles.eye + ' ' + styles.eyeRight}></div>
              <div className={styles.beak}></div>
              
              {/* Gorro de piloto */}
              <div className={styles.pilotHat}>
                <div className={styles.hatTop}></div>
                <div className={styles.hatBrim}></div>
                <div className={styles.hatVisor}></div>
                <div className={styles.hatBadge}></div>
              </div>
            </div>
            
            {/* Alas */}
            <div className={styles.wing + ' ' + styles.wingLeft}></div>
            <div className={styles.wing + ' ' + styles.wingRight}></div>
            
            {/* Patas */}
            <div className={styles.feet}>
              <div className={styles.foot + ' ' + styles.footLeft}></div>
              <div className={styles.foot + ' ' + styles.footRight}></div>
            </div>
          </div>
        </div>
      </div>
      
      <p className={styles.message}>{message}</p>
    </div>
  );
}
