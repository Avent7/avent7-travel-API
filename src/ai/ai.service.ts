import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import OpenAI, { APIError } from 'openai';

@Injectable()
export class AiService implements OnModuleInit {
  private readonly logger = new Logger(AiService.name);
  private openai!: OpenAI;
  private model!: string;
  private reasoningEffort!: 'low' | 'medium' | 'high';

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.model = this.configService.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini';
    this.reasoningEffort = (this.configService.get<string>('OPENAI_REASONING_EFFORT') ?? 'low') as 'low' | 'medium' | 'high';

    if (!apiKey) {
      this.logger.error('OPENAI_API_KEY não está definida nas variáveis de ambiente.');
      throw new Error('OPENAI_API_KEY não está configurada.');
    }

    this.openai = new OpenAI({ apiKey });
    this.logger.log(`AiService iniciado — modelo: ${this.model}`);
  }

  async generateWithWebSearch(prompt: string): Promise<{ reply: string }> {
    try {
      const response = await this.openai.responses.create({
        model: this.model,
        input: prompt,
        tools: [{ type: 'web_search_preview' }],
      });
      return { reply: response.output_text };
    } catch (error) {
      if (error instanceof APIError) {
        this.logger.error(`Erro da API OpenAI (web search) [${error.status}]: ${error.message}`);
        throw new BadGatewayException(
          `Erro ao se comunicar com a OpenAI: ${error.message}`,
        );
      }
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Erro inesperado ao chamar a OpenAI com web search', err.stack);
      throw new InternalServerErrorException(
        'Ocorreu um erro inesperado ao processar sua solicitação.',
      );
    }
  }

  async generateStream(prompt: string, res: Response): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    try {
      const stream = await this.openai.responses.create({
        model: this.model,
        input: prompt,
        reasoning: { effort: this.reasoningEffort },
        stream: true,
      });

      for await (const event of stream) {
        if (event.type === 'response.output_text.delta') {
          res.write(`data: ${JSON.stringify({ delta: event.delta })}\n\n`, 'utf8');
        }
      }

      res.write(`data: [DONE]\n\n`, 'utf8');
    } catch (error) {
      if (error instanceof APIError) {
        this.logger.error(`Erro de streaming OpenAI [${error.status}]: ${error.message}`);
        res.write(`data: ${JSON.stringify({ error: `Erro da OpenAI: ${error.message}` })}\n\n`, 'utf8');
      } else {
        const err = error instanceof Error ? error : new Error(String(error));
        this.logger.error('Erro inesperado no streaming', err.stack);
        res.write(`data: ${JSON.stringify({ error: 'Erro inesperado ao processar sua solicitação.' })}\n\n`, 'utf8');
      }
    } finally {
      res.end();
    }
  }

  async generate(prompt: string): Promise<{ reply: string }> {
    try {
      const response = await this.openai.responses.create({
        model: this.model,
        input: prompt,
      });

      return { reply: response.output_text };
    } catch (error) {
      if (error instanceof APIError) {
        this.logger.error(`Erro da API OpenAI [${error.status}]: ${error.message}`);
        throw new BadGatewayException(
          `Erro ao se comunicar com a OpenAI: ${error.message}`,
        );
      }

      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Erro inesperado ao chamar a OpenAI', err.stack);
      throw new InternalServerErrorException(
        'Ocorreu um erro inesperado ao processar sua solicitação.',
      );
    }
  }
}
