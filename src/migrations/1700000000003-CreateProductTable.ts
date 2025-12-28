import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateProductTable1700000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'product',
        columns: [
          {
            name: 'product_id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'product_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'product_code',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'quantity',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'base_price',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'uom',
            type: 'varchar',
            default: "'PER_PIECE'",
          },
          {
            name: 'company_id',
            type: 'int',
          },
          {
            name: 'created_by',
            type: 'int',
          },
          {
            name: 'created_on',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_by',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'updated_on',
            type: 'timestamp',
            isNullable: true,
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'product',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['company_id'],
        referencedTableName: 'company',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('product');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('company_id') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('product', foreignKey);
    }
    await queryRunner.dropTable('product');
  }
}

