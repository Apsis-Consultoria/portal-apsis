import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import mysql from 'npm:mysql2@3.9.1/promise';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, query, params } = await req.json();

    // Credenciais do MySQL (armazenadas como segredos)
    const connection = await mysql.createConnection({
      host: Deno.env.get('MYSQL_HOST'),
      port: parseInt(Deno.env.get('MYSQL_PORT') || '3306'),
      database: Deno.env.get('MYSQL_DATABASE'),
      user: Deno.env.get('MYSQL_USER'),
      password: Deno.env.get('MYSQL_PASSWORD'),
    });

    let result;

    if (action === 'query') {
      // Executar uma consulta SELECT
      const [rows] = await connection.execute(query, params || []);
      result = rows;
    } else if (action === 'insert') {
      // Inserir dados
      const [insertResult] = await connection.execute(query, params || []);
      result = { insertId: insertResult.insertId, affectedRows: insertResult.affectedRows };
    } else if (action === 'update') {
      // Atualizar dados
      const [updateResult] = await connection.execute(query, params || []);
      result = { affectedRows: updateResult.affectedRows };
    } else if (action === 'delete') {
      // Deletar dados
      const [deleteResult] = await connection.execute(query, params || []);
      result = { affectedRows: deleteResult.affectedRows };
    } else {
      await connection.end();
      return Response.json({ error: 'Ação inválida' }, { status: 400 });
    }

    await connection.end();

    return Response.json({
      success: true,
      data: result,
      message: `Ação '${action}' executada com sucesso`
    });

  } catch (error) {
    console.error('MySQL Integration Error:', error);
    return Response.json(
      { error: error.message || 'Erro ao conectar ao MySQL' },
      { status: 500 }
    );
  }
});