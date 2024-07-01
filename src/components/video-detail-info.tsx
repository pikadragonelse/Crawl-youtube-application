import React from 'react';
import { VideoInfo } from '../models/manage-page';

export type VideoDetailInfo = { videoInfo?: VideoInfo };
export const VideoDetailInfo: React.FC<VideoDetailInfo> = ({ videoInfo }) => {
  return (
    <div className="">
      {videoInfo != null ? (
        <div className="">
          <video width="480" height="240" controls className="rounded-xl">
            <source src={videoInfo.videoLinkToShow} type="video/mp4" />
          </video>
          <div className="mt-6">
            <h1 className="text-xl">{videoInfo.title}</h1>
          </div>
        </div>
      ) : (
        'Không tồn tại video'
      )}
    </div>
  );
};
