"use client";
import React from "react";
import "./achievements.css";
import Image from "next/image";

const AchievementsItem = ({ title, description, icon }: any) => {
  return (
    <div className="achievements-item">
      <img className="achievements__img" src={icon} alt={`${title} icon`} />
      <div className="achievements-info">
        <h3 className="achievements-name">{title}</h3>
        <p className="achievements-description">{description}</p>
      </div>
    </div>
  );
};

const Achievements = ({ user }: any) => {
  return (
    <section id="achievements" className="container">
      <h2 className="section-title">Achievements</h2>
      <div className="achievements-items">
        {user.total_goals < 5 ? (
          <p>You have no achievements yet. Keep working towards your goals!</p>
        ) : (
          <>
            {user.total_goals >= 5 && (
              <AchievementsItem
                title="Bronze"
                description="Attain the bronze achievement with a total of 5 goals."
                icon="/assets/bronze-medal.svg"
              />
            )}
            {user.total_goals >= 10 && (
              <AchievementsItem
                title="Silver"
                description="Secure the silver achievement by reaching a total of 10 goals."
                icon="/assets/silver-medal.svg"
              />
            )}
            {user.total_goals >= 20 && (
              <AchievementsItem
                title="Gold"
                description="Achieve a legendary status with a total of 20 goals."
                icon="/assets/gold-medal.svg"
              />
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Achievements;
