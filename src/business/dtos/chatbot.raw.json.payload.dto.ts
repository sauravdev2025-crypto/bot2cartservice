import { Expose } from 'class-transformer';
import { IsArray, IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class ChatbotNode {
  @Expose()
  @IsNotEmpty()
  id: string;

  @Expose()
  @IsOptional()
  nextEdgeId: number;

  @Expose()
  @IsNotEmpty()
  type: string;

  @Expose()
  @IsObject()
  position: {
    x: number;
    y: number;
  };

  @Expose()
  @IsObject()
  data: any;

  @Expose()
  width: number;

  @Expose()
  height: number;

  @Expose()
  selected: boolean;

  @Expose()
  @IsObject()
  positionAbsolute: {
    x: number;
    y: number;
  };

  @Expose()
  dragging: boolean;
}

export class ChatbotEdge {
  @Expose()
  @IsNotEmpty()
  source: string;

  @Expose()
  sourceHandle: string | null;

  @Expose()
  @IsNotEmpty()
  target: string;

  @Expose()
  targetHandle: string | null;

  @Expose()
  @IsNotEmpty()
  type: string;

  @Expose()
  @IsNotEmpty()
  id: string;

  @Expose()
  @IsObject()
  data?: any;
}

export class ChatbotRawJsonPayloadDto {
  @Expose()
  @IsArray()
  nodes: ChatbotNode[];

  @Expose()
  @IsArray()
  edges: ChatbotEdge[];
}
