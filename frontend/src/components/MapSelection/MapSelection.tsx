import React, { useState } from 'react';
import './MapSelection.css';

interface MapSelectionProps {
  maps: any[];
  onSelectMap: (mapId: string | null) => void;
  onStartGame: () => void;
}

const MapSelection: React.FC<MapSelectionProps> = ({ maps, onSelectMap, onStartGame }) => {
  const [startIndex, setStartIndex] = useState<number>(0);
  const displayCount = 4;

  const [selectedMapIndex, setSelectedMapIndex] = useState<number | null>(null);

  const handleMapSelect = (mapIndex: number) => {
    setSelectedMapIndex(mapIndex);
    onSelectMap(mapIndex < maps.length ? maps[mapIndex].id.toString() : null);
  };
  
  const handleStartGame = () => {
    onStartGame();
  };

  const handleArrowClick = (direction: 'left' | 'right') => {
    const increment = direction === 'left' ? -displayCount : displayCount;
    let newIndex = (startIndex + increment + maps.length) % maps.length;
    setStartIndex(newIndex);
  };    
    
  const renderMapSelection = () => {
    let items = [];
  
    for (let i = 0; i < displayCount; i++) {
      let mapIndex = (startIndex + i) % maps.length;
  
      const isSelected = mapIndex === selectedMapIndex;
      const mapItem = maps[mapIndex];
  
      items.push(
        <div
          key={mapIndex}
          className={`game_item ${isSelected ? 'selected-map' : ''}`}
          onClick={() => handleMapSelect(mapIndex)}
        >
          {mapItem.imageUrl ? (
            <img src={mapItem.imageUrl} alt={mapItem.name} className="map-image" />
          ) : (
            <div className="no-map-option">{mapItem.name}</div>
          )}
        </div>
      );
    }
  
    return items;
  };  
  
  return (
    <>
      <h2 className='game_title'>Select your Map</h2>
      <div className='game_map'>
        <div className='arrow left-arrow' onClick={() => handleArrowClick('left')}>&lt;</div>

        <div className='game_items'>
          {renderMapSelection()}
        </div>

        <div className='arrow right-arrow' onClick={() => handleArrowClick('right')}>&gt;</div>

        <div className="container1">
          <div className="btn1" onClick={onStartGame}>
            <a href="#">Start Game</a>
          </div>
        </div>
      </div>
    </>
  );
};

export default MapSelection;
